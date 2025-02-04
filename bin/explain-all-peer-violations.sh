#!/bin/bash
# This script explains all peer requirement violations matching certain parameters.
# The default matches incorrect react/react-dom versions requested by transitive
# dependencies of @wordpress packages.
packages="react\|react-dom"
violations_from="@wordpress"

# Use grep to find all lines containing hashes inside parentheses following a dependency,
# then use cut to split each line on the "(" character and take the second part. After that, 
# split on ")" and take the first part to get the hash. Sort the output and remove duplicates with uniq.
ids=$(yarn install | grep "satisfy what $violations_from" | grep "$packages" | grep "\(([^()]*)\)" | cut -d "(" -f 2 | cut -d ")" -f 1 | sort | uniq)

violations=""
# Now loop over each unique ID and run yarn explain peer-requirements
for id in $ids; do
	# Save all peer requirement violations without spaces/tabs.
	violation=$(yarn explain peer-requirements "$id" | grep "✘" | tr -d " \t")
	violations+="$violation\n"
done

echo "The following packages likely request '$packages' at a version different from the one provided by $violations_from."
echo "Run 'yarn' and then 'yarn explain peer-requirements <id>' to see the exact issue."
echo "Note that some violation warnings may be discarded by .yarnrc.yml, in which case this script won't see them"

# Print all unique violations (only the package name and version)
echo -e "$violations" | sed -E 's/➤YN0000:(.*)\[[0-9a-f]+\].*/\1/' | sort | uniq
