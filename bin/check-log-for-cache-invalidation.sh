#!/bin/bash
# This file should be used when building the Dockerfile. It will output a TeamCity
# service message if the Webpack cache is invalidated. That in turn will help us
# update the cache. Its input should be the full output of the webpack log.
# Unfortunately, I don't know how to tap into the actual webpack log system to do
# this, so this will have to do for now.

build_file=$1
if [[ ! -f $build_file ]] ; then
	echo "$build_file does not exist. This should contain the webpack output."
	exit 0
fi

if grep "resolving of build dependencies is invalid" $build_file ; then
	echo "##teamcity[message text='Webpack cache invalidated!' errorDetails='This commit invalidated the webpack cache. Base image will be updated with new cache contents if on trunk.' status='warning']"
	echo "##teamcity[setParameter name='env.WEBPACK_CACHE_INVALIDATED' value='true']"

	echo "Relevant details:"
	# Exclude the vast number of files that get serialized.
	grep "cache.PackFileCacheStrategy" $build_file | grep -v "Serialization of"

fi
