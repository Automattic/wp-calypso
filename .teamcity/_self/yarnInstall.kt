package _self

/**
 * Use variable in scripts to take advantage of node_module caching.
 */
val yarn_install_cmd = """
	# Do not type-check packages on postinstall, we already have a unit test for that
	export SKIP_TSC=true

	# Install modules. We save to the file while also outputting it for visibility.
	yarn_out="/tmp/yarn-json-output.json"
	yarn --json | tee -a "${'$'}yarn_out"

	# Yarn --json saves as newline-delimited JSON. To make the JSON file valid,
	# we add brackets at the beginning and end and commas on each entry in between.
	# Inspired by https://stackoverflow.com/a/35021663.
	sed -i -e '1s/^/[/' -e '${'$'}!s/$/,/' -e '${'$'}s/$/]/' "${'$'}yarn_out"
""".trimIndent()
