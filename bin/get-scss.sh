#/bin/sh
pushd `dirname $0` > /dev/null
SCRIPTPATH=`pwd -P`
popd > /dev/null

cd $SCRIPTPATH/../
( find client assets -type f -name '*.scss' | while read line; do echo `pwd`"/$line"; done | cat && cat client/exclude-scss-from-build ) | sort | uniq -u
