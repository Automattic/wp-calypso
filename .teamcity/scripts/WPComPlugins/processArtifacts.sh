#!/bin/bash

set -x

# Function to process artifact.
# Bare-bones for now as this is PoC.
process_artifacts () {
	# Directory of the package eg. apps/notifications.
	declare workingDir=$1
	# Directory of the output files after a build.
	declare archiveDir=$2

	if [ -d "$workingDir/dist" ]; then
		# If the build outputs to the dist/ dir.
		archiveDir="dist/"
	elif [ -d "$workingDir/release-files" ]; then
		# If the build outputs to the release-files dir.
		archiveDir="release-files/"
	else
		# If neither directories were detected.
		printf "Did not find archive directory for plugin $workingDir."
		exit
	fi

	# Copy the README file.
	cp $workingDir/README.md $workingDir/$archiveDir

	# Other plugins may need additional processing. Do it here.

	printf "Finished processing artifacts for $workingDir."
}

# For each plugin, initialize a background process to copy the
# appropriate files in preparation for TeamCity to bundle the artifact.
for dir in $@}; do
	printf "Processing artifacts for apps/$dir."
	process_artifacts "apps/$dir" "./dist/" &
done
