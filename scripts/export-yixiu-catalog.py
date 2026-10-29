#!/usr/bin/env python3
"""Export registered tool names/descriptions from the iOS String Catalog.

Usage: python3 scripts/export-yixiu-catalog.py ../ToolboxOne
Only reads the iOS project. No entitlements or pricing are exported.
"""
import json
import re
import sys
from pathlib import Path

root = Path(sys.argv[1]) / 'ToolboxOne'
strings = json.loads((root / 'Resources/Localization/Localizable.xcstrings').read_text())['strings']
languages = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'ko', 'de', 'fr', 'es']
sources = [(p, p.read_text()) for p in root.rglob('*.swift')]
aliases = {}
symbols = {}
for _, source in sources:
    for symbol, tool_id in re.findall(r'static let (\w+): ToolID = "([^"]+)"', source):
        symbols[symbol] = tool_id
    for symbol, key in re.findall(r'static var (\w+): String \{ AppLocalization\.(?:string|text)\("([^"]+)"', source):
        aliases.setdefault(symbol, set()).add(key)

def localization_key(expression, category=None):
    match = re.search(r'AppLocalization\.(?:string|text)\("([^"]+)"', expression)
    if match:
        return match[1]
    literal = re.fullmatch(r'"([^"]+)"', expression.strip())
    if literal:
        return literal[1]
    options = aliases.get(expression.strip().split('.')[-1], set())
    if category and len(options) > 1:
        options = {key for key in options if key.startswith('tool.' + category + '.')}
    if len(options) != 1:
        raise ValueError(f'Ambiguous localization expression: {expression}: {options}')
    return next(iter(options))

metadata = {}
for _, source in sources:
    for match in re.finditer(r'(?:ToolDefinition|\.init)\(\s*id:\s*(\.[\w]+|"[^"\n]+"|ToolID\("[^"\n]+"\)),\s*name:\s*(.*?),\s*shortDescription:\s*(.*?),\s*icon:', source, re.S):
        tool, name, description = match.groups()
        tool_id = symbols[tool[1:]] if tool.startswith('.') else re.search(r'"([^"]+)"', tool)[1]
        category = tool_id.split('.')[0]
        metadata[tool_id] = (localization_key(name, category), localization_key(description, category))

# Photo cleanup registers its modes through allCases rather than literal definitions.
for tool, symbol in {'cleanup': 'cleanup', 'duplicates': 'duplicates', 'similar': 'similarPhotos', 'screenshots': 'screenshots', 'largeMedia': 'largeMedia', 'blurry': 'blurry'}.items():
    metadata['photos.' + tool] = (localization_key('L10n.Photos.' + symbol), 'photos.description.plain')

order_source = (root / 'Core/Tooling/ToolRegistry.swift').read_text().split('enum ToolCategoryOrder')[1]
groups = re.findall(r'\.(\w+): \[([^\]]+)\]', order_source)
# Category display order comes from allCases, not the rank dictionary's source order.
category_source = (root / 'Core/Tooling/ToolCategory.swift').read_text().split('var id:')[0]
category_order = re.findall(r'^    case (\w+)\s*$', category_source, re.M)
group_map = dict(groups)
if set(category_order) != set(group_map):
    raise ValueError('Category definitions and Registry ordering differ')
catalog = {'languages': languages, 'categories': []}
seen = set()
for category in category_order:
    raw_ids = group_map[category]
    ids = re.findall(r'"([^"]+)"', raw_ids)
    tools = []
    for tool_id in ids:
        if tool_id in seen:
            raise ValueError('Duplicate tool: ' + tool_id)
        seen.add(tool_id)
        name_key, description_key = metadata[tool_id]
        texts = {}
        for language in languages:
            name = strings[name_key]['localizations'][language]['stringUnit']['value']
            description = strings[description_key]['localizations'][language]['stringUnit']['value']
            if not name.strip() or not description.strip():
                raise ValueError(f'Empty translation: {tool_id} {language}')
            texts[language] = [name, description]
        tools.append({'id': tool_id, 'text': texts})
    category_key = 'photos.category' if category == 'photos' else 'category.' + category
    titles = {language: strings[category_key]['localizations'][language]['stringUnit']['value'] for language in languages}
    catalog['categories'].append({'id': category, 'title': titles, 'tools': tools})
catalog['toolCount'] = len(seen)
catalog['categoryCount'] = len(catalog['categories'])
# Fail rather than silently ship an incomplete directory after adding a tool.
guide_ids = set(json.loads((root / 'Resources/ToolGuide.json').read_text()))
if seen != guide_ids:
    raise ValueError(f'Registry/guide mismatch: missing {guide_ids - seen}, extra {seen - guide_ids}')
target = Path(__file__).resolve().parents[1] / 'apps/yixiu-tools/catalog.js'
target.write_text('/* Generated from the iOS Registry order and String Catalog. */\nwindow.YixiuCatalog = ' + json.dumps(catalog, ensure_ascii=False, indent=2) + ';\n')
print(f'Exported {len(seen)} tools, {len(groups)} categories, {len(languages)} languages to {target}')
