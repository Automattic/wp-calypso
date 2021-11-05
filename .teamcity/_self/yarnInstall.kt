package _self

/**
 * Use variable in scripts to take advantage of node_module caching.
 */
val yarn_install_cmd = """
	# Do not type-check packages on postinstall, we already have a unit test for that
	export SKIP_TSC=true

	# Install modules. Outputs to stdout while also saving to a variable for later use.
	exec 5>&1
	yarn_output=${'$'}( yarn install 2>&1 | tee /dev/fd/5 )
""".trimIndent()
