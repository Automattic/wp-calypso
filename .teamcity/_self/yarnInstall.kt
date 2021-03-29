package _self

/**
 * Use variable in scripts to take advantage of node_module caching.
 */
val yarn_install_cmd = """
	# Load existing node_modules to reduce install time.
	if [ -d /calypso/node_modules ] && [ "%use_cached_node_modules%" == "true" ] ; then
		echo "Loading existing found node_modules..."
		mv /calypso/node_modules ./node_modules
	else
		echo "No existing node_modules were found."
	fi

	# Install modules.
	yarn install
""".trimIndent()
