#!/bin/bash
set -Eeuo pipefail

RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
RESET=$(tput sgr0)

# sed -i behaves differently between macos and linux platforms.
# See https://stackoverflow.com/a/51060063
# To use this, do `sed "${sedi[@]}" -e $sed_expression`
sedi=(-i)
# macOS version of sed doesn't support `--version` param and exits with code 1
if ! sed --version > /dev/null 2>&1 ; then
	# For macOS, use two parameters
	sedi=(-i "")
fi

# Can enter as many packages as you want, space deliminated.
packages="${1-}"

# If no packages were entered, we'll generate a list of packages based on the 
# incorrect peer dependency warnings.
if [ -z "$packages" ] ; then
	echo "Since no packages were passed, we'll generate a list from the yarn output."
	yarn_out="yarn-json-output.json"
	yarn --json > "$yarn_out"

	# Yarn --json saves as newline-delimited JSON. To make the JSON file valid,
	# we add brackets at the beginning and end and commas on each entry in between.
	# Inspired by https://stackoverflow.com/a/35021663.
	sed "${sedi[@]}" -e '1s/^/[/; $!s/$/,/; $s/$/]/' "$yarn_out"

	# 1. Send the yarn output (in JSON format) to the jq command.
	# 2. Filter for the YN002 error code, the "$package doesn't provide $peer" warning.
	# 3. Select the warning message for each error code.
	# 4. Select just the package portion of the warning, which is just any character
	#    until the "@npm:version" portion of the string.
	# 5. Since each package can have multiple warnings, remove duplicates.
	broken_packages=$( cat "$yarn_out" | jq --raw-output '.[] | select(.name == 2) | .data' | sed -E "s/^(@?.[^@]*).*/\1/g" | uniq )

	# Change from newline to spaces for delimination. This makes it easy to loop through.
	packages="${broken_packages//$'\n'/ }"
fi

if [ -z "$packages" ] ; then
	echo "Nothing to do, as no peer warnings were found and no package was passed."
	exit
fi

echo -e "Checking these packages: $packages\n"

for package in $packages ; do
	echo "Checking package ${GREEN}$package${RESET}"

	# Finds versions of the package overridden in yarnrc.yml. It saves as a newline
	# deliminated string. So an input of @wordpress/components will find each package
	# like '@wordpress/components@12.0.9', and then save all the versions in the order
	# it finds them, like "12.0.9\n11.1.9\n13.1.1".
	available_versions=$( sed -nE "s|^[[:space:]]+'$package@(.*)'.*|\1|gp" .yarnrc.yml)
	
	# Sorts by version (-V) and then saves the newest version found in yarnrc.yml. This
	# entry is the one we need to update with the newest version update. The other
	# entries do not need to be updated, because they likely match stale packages.
	current_version=$( sort -rV <<< "$available_versions" | head -n1 )

	# Double check that the package is actually installed.
	if ! yarn info "$package" -AR > /dev/null ; then
		echo -e "\tNo match for $package, skipping."
		continue
	fi

	# 1. Gets the package info from yarn, including transitive dependencies.
	# 2. Outputs the "version" of the package.
	# 3. Sorts the list of versions in order, since multiple different versions
	#    for a package could be installed.
	# 4. Take the largest version number from the list.
	update_version=$( yarn info "$package" -AR --json | jq --raw-output ".children.Version" | sort -Vr | head -n1 )

	# Helpful colors to show out-of-date yarnrc versions.
	[[ "$current_version" = "$update_version" ]] && yarnrc_color=${GREEN} || yarnrc_color=${YELLOW}

	echo -e "\t.yarnrc.yml override version:\t${yarnrc_color}$current_version${RESET}"
	echo -e "\tpackage version from yarn:\t${GREEN}$update_version${RESET}"

	if [ "$current_version" == "$update_version" ] ; then
		continue
	fi

	# Finally, replace the package version entry in yarnrc.yml with the new version.
	sed "${sedi[@]}" -E "s|'$package@$current_version'|'$package@$update_version'|" ".yarnrc.yml"
	echo -e "\tUpdated yarnrc entry!"
done
