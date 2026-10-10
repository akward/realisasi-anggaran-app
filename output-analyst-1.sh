git checkout main
     rm -rf docs/old tests/legacy
     git add -u
     git commit -m "Remove obsolete docs and legacy tests"
     git push origin main