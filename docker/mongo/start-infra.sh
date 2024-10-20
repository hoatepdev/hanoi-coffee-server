#!/bin/bash

docker-compose -f docker-compose-infra.yml down
docker-compose -f docker-compose-infra.yml up -d --remove-orphans

sleep 30
