#!/bin/bash
# This script takes a directory for an argument, and renames all files contained within to place them in a random order, prefixing them with #_, where the # is from 0 to the number of files in the directory

if [ $# -ne 1 ]; then
  echo "Please provide a directory name as the sole argument to this script"
  exit 1
fi

DIR=$1

NUM=0
for file in $(ls $DIR | shuf); do
	echo $file
	mv $DIR/$file $DIR/${NUM}_${file}
	((NUM++))
done
