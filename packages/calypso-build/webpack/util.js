/**
 * Transform webpack output.filename and output.chunkFilename to CSS variants
 *
 * @param {(string|undefined)} name filename, chunkFilename or undefined
 * @return {(string|undefined)}     Transformed name or undefined
 */
function cssNameFromFilename( name ) {
	if ( name ) {
		const [ cssChunkFilename, chunkQueryString ] = name.split( '?', 2 );
		return cssChunkFilename.replace(
			/\.js$/i,
			'.css' + ( chunkQueryString ? `?${ chunkQueryString }` : '' )
		);
	}
}

const nodeModulesToTranspile = [
	// general form is <package-name>/.
	// The trailing slash makes sure we're not matching these as prefixes
	// In some cases we do want prefix style matching (lodash. for lodash.assign)
	'd3-array/',
	'd3-scale/',
	'debug/',
];

/**
 * Check to see if we should transpile certain files in node_modules
 * @param {String} filepath the path of the file to check
 * @returns {Boolean} True if we should transpile it, false if not
 *
 * We had a thought to try to find the package.json and use the engines property
 * to determine what we should transpile, but not all libraries set engines properly
 * (see d3-array@2.0.0). Instead, we transpile libraries we know to have dropped Node 4 support
 * are likely to remain so going forward.
 */
function shouldTranspileDependency( filepath ) {
	// find the last index of node_modules and check from there
	// we want <working>/node_modules/a-package/node_modules/foo/index.js to only match foo, not a-package
	const marker = '/node_modules/';
	const lastIndex = filepath.lastIndexOf( marker );
	if ( lastIndex === -1 ) {
		// we're not in node_modules
		return false;
	}

	const checkFrom = lastIndex + marker.length;

	return nodeModulesToTranspile.some(
		modulePart => filepath.substring( checkFrom, checkFrom + modulePart.length ) === modulePart
	);
}

module.exports = { cssNameFromFilename, shouldTranspileDependency };
