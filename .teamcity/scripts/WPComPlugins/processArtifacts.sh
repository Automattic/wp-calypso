set -x

# Plugins that need to have artifacts processed.
declare pluginDirs=("inline-help" "happy-blocks")

# Function to process artifact.
# Bare-bones for now as this is PoC.
process_artifacts () {
	declare workingDir=$1
	declare archiveDir=$2

	cd $workingDir
	cp README.md $workingDir/$archiveDir
}

for dir in ${pluginDirs[@]}; do
	process_artifacts "apps/$dir" "./dist/" &
done
