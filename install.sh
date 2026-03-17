#!/bin/bash
cd /workspace/frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --omit=dev --no-optional 2>&1 | tail -30
