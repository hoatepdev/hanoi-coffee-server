#!/bin/bash

mongo <<EOF
ddb = db.getSiblingDB('hanoi-coffee')

db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [{ role: 'readWrite', db: 'hanoi-coffee' }],
});
EOF