#!/bin/sh

file="$1"
printf $file
if [[ ! $file =~ ^client/[^\.]+\.jsx?$ ]]; then
	printf "\nNot a prettifiable file\n"
	exit 0
fi

if [ ! -f ./node_modules/.bin/prettier ]; then
	printf "\n'Prettier' not found, please run 'npm install' first\n"
	exit 1
fi

./node_modules/.bin/prettier --print-width=100 --single-quote --tab-width=4 --trailing-comma=es5 --write ${file}
