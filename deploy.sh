#!/usr/bin/env bash
set -e

git checkout main
git branch -D hf-deploy 2>/dev/null || true
git checkout --orphan hf-deploy
git rm -r --cached . > /dev/null

# binary files must go through Git LFS for Hugging Face to accept them
printf '%s\n' '*.pdf filter=lfs diff=lfs merge=lfs -text' \
              '*.bin filter=lfs diff=lfs merge=lfs -text' \
              '*.png filter=lfs diff=lfs merge=lfs -text' \
              '*.sqlite3 filter=lfs diff=lfs merge=lfs -text' > .gitattributes

git add -A
git commit -q -m "IPBot deployment"
git push space hf-deploy:main --force
git checkout main

echo "Deployed"
