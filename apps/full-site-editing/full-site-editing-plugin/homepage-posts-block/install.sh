#!/usr/bin/env bash

# Newspack git repository.
newspack_git_repo="git@github.com:Automattic/newspack-blocks.git";

# Newspack local folder
newspack_git_folder="newspack-blocks";

cleanup() {
	# Cleanup folder
	rm -rf $newspack_git_folder;
}

cleanCache() {
	git rm --cached $newspack_git_repo
}

createNewspackFolder() {
	echo "Creating '$newspack_git_folder' folder...";
		mkdir -p $newspack_git_folder;
}

addGitSubmodule() {
	echo "Add Newspack '$newspack_git_repo' git submodule... ";
	git submodule add $newspack_git_repo $newspack_git_folder;
}

initGitSubmodule() {
	echo "Init git submoduless...";
#	cd $newspack_git_folder; git submodule init; git submodule update --recursive;
}

install () {
#	createNewspackFolder;
	addGitSubmodule;
#	initGitSubmodule;
}

echo $1;

if [ "$1" == 'clean' ];
then
	cleanup;
#elif [ "$1" == 'submodule' ];
#then
#	initGitSubmodule;
elif [ "$1" == 'clean-cache' ];
then
	cleanCache;
else
	install;
fi;
