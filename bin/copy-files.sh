JETPACK_DIR="/home/javi/work/jetpackSandbox/wp-content/plugins/jetpack-ui"

find ./public -iregex ".*manifest.*\.js" !  -iregex ".*\.m\.js" -exec mv {} $JETPACK_DIR/public/manifest.js \;
find ./public -iregex ".*build.*\.js" !  -iregex ".*\.m\.js" -exec mv {} $JETPACK_DIR/public/build.js \;
find ./public -iregex ".*vendor.*\.js" !  -iregex ".*\.m\.js" -exec mv {} $JETPACK_DIR/public/vendor.js \;
cp ./public/jetpack.css $JETPACK_DIR/public/
cp ./public/jetpack-debug.css $JETPACK_DIR/public/
cp ./public/jetpack-debug.css.map $JETPACK_DIR/public/

# npm run -s build-server && NODE_PATH=$NODE_PATH:server:client:. CALYPSO_ENV=jetpack node server/bundler/bin/bundler.js && ./bin/copy-files.sh
