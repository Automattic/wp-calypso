#!/bin/bash
set -x

function get_hash {
	# If the stylesheet in the HTML file is pointing at "build.min.css?foobar123",
	# this will just return the "foobar123" portion of the file. This
	# is a source of randomness which needs to be eliminated.
	echo `sed -nE 's~.*<link rel="stylesheet" href="build.min.css\?([a-zA-Z0-9]+)">.*~\1~p' $1`
}

# This script's cwd is the "previous release artifact". Up a directory (..) is
# the main directory of notifications, so we can access the new build there.
new_hash=`get_hash ../dist/index.html`
old_hash=`get_hash index.html`

# All scripts and styles use the same "hash" version, so replace any
# instances of the hash in the *old* files with the newest version.
sed -i "s~$old_hash~$new_hash~g" index.html rtl.html

# Replace the old cache buster with the new one in the previous release html files.
old_cache_buster=`jq -r '.cache_buster' build_meta.json`
new_cache_buster=`jq -r '.cache_buster' ../dist/build_meta.json`

sed -i "s~$old_cache_buster~$new_cache_buster~g" index.html rtl.html
