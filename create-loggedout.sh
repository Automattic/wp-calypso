#!/bin/sh
mkdir ./login-build
rm -rf ./login-build/*
#rm -rf ./public/build.*
#rm -rf ./public/vendor.*
#rm -rf ./public/manifest.*

echo Creating:
./node_modules/.bin/webpack --config webpack.login.js --json | jq -r '.assets[] | .name'

ls ./public/build.*
ls ./public/vendor.*
ls ./public/manifest.*


cp ./login-build/build.* `ls ./public/build.*`
cp ./login-build/vendor.* `ls ./public/vendor.*`
cp ./login-build/manifest.* `ls ./public/manifest.*`
