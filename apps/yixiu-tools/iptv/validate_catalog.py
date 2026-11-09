#!/usr/bin/env python3
"""Offline publishing checks. This cannot establish programme copyright or playback rights."""
import json,sys,datetime
from pathlib import Path
from urllib.parse import urlsplit

def date(value):
 d=datetime.datetime.fromisoformat(value.replace('Z','+00:00'))
 assert d.tzinfo is not None,'Date requires timezone'
 return d

def url(value,https=False):
 p=urlsplit(value)
 assert p.scheme in (['https'] if https else ['https','http']) and p.hostname
 assert not p.username and not p.password and len(value)<=8192

p=Path(sys.argv[1]);raw=p.read_bytes();assert len(raw)<=8_000_000
v=json.loads(raw)
assert v['schema']==1 and type(v['revision']) is int and v['revision']>=1
assert date(v['expiresAt'])>date(v['publishedAt'])
assert date(v['publishedAt'])<=datetime.datetime.now(datetime.timezone.utc)
entries=v['channels'];assert len(entries)<=20_000
assert len({e['id'] for e in entries})==len(entries)
for e in entries:
 assert 0<len(e['id'])<=200 and 0<len(e['name'])<=200
 assert e.get('sourceID') is None
 assert type(e['enabled']) is bool
 m=e['metadata'];assert m['origin'] in ['official','community']
 assert m['authorization'] in ['verified','unverified']
 assert len(m['languages'])<=20 and len(m['categories'])<=20
 if e.get('streamURL'):url(e['streamURL'])
 if e.get('logo'):url(e['logo'])
 if m.get('sourceURL'):url(m['sourceURL'])
 if m['authorization']=='verified' or m['recommended']:
  assert m['origin']=='official' and m['authorization']=='verified'
  url(e['streamURL'],True);url(m['sourceURL'],True);url(m['permissionURL'],True)
  for key in ['permissionBasis','attribution','reviewedBy']:assert m[key].strip() and len(m[key])<=2000
  assert date(m['validUntil'])>date(m['verifiedAt'])
print(f'PASS: revision {v["revision"]}, {len(entries)} entries, {len(raw)} bytes. Permission records still require human verification.')
