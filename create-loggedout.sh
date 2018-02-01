#!/bin/sh
mkdir ./login-build
rm -rf ./login-build/*
#rm -rf ./public/build.*.js
#rm -rf ./public/vendor.*.js
#rm -rf ./public/manifest.*.js

echo Creating loggedout build
./node_modules/.bin/webpack --config webpack.login.js --json | jq -r '.assets[] | .name'

ls ./public/build.*.js
ls ./public/vendor.*.js
ls ./public/manifest.*.js

cp ./login-build/build.* `ls ./public/build.*.js`
cp ./login-build/vendor.* `ls ./public/vendor.*.js`
cp ./login-build/manifest.* `ls ./public/manifest.*.js`
