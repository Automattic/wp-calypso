/**
 * External dependencies
 */
const webpack = require( 'webpack' );

/**
 * Transform webpack output.filename and output.chunkFilename to CSS variants
 *
 * @param {(string|undefined)} name filename, chunkFilename or undefined
 * @returns {(string|undefined)}     Transformed name or undefined
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

function IncrementalProgressPlugin() {
	function createProgressHandler() {
		const startTime = Date.now();
		let lastShownBuildingMessageTime = null;
		let lastUnshownBuildingMessage = null;

		return ( percentage, msg, ...details ) => {
			const nowTime = Date.now();
			const timeString = ( ( nowTime - startTime ) / 1000 ).toFixed( 1 ) + 's';
			const percentageString = `${ Math.floor( percentage * 100 ) }%`;
			const detailsString = details
				.map( detail => {
					if ( ! detail ) {
						return '';
					}
					if ( detail.length > 40 ) {
						return `…${ detail.substr( detail.length - 39 ) }`;
					}
					return detail;
				} )
				.join( ' ' );
			const message = `${ timeString } ${ percentageString } ${ msg } ${ detailsString }`;

			// There are plenty of 'building' messages that make the log too long for CircleCI web UI.
			// Let's throttle the 'building' messages to one per second, while always showing the last one.
			if ( msg === 'building' ) {
				if ( lastShownBuildingMessageTime && nowTime - lastShownBuildingMessageTime < 1000 ) {
					// less than 1000ms since last message: ignore, but store for case it's the last one
					lastUnshownBuildingMessage = message;
					return;
				}

				// the message will be shown and its time recorded
				lastShownBuildingMessageTime = nowTime;
				lastUnshownBuildingMessage = null;
			} else if ( lastUnshownBuildingMessage ) {
				// The last 'building' message should always be shown, no matter the timing.
				// We do that on the first non-'building' message.
				console.log( lastUnshownBuildingMessage ); // eslint-disable-line no-console
				lastUnshownBuildingMessage = null;
			}

			console.log( message ); // eslint-disable-line no-console
		};
	}
	return new webpack.ProgressPlugin( createProgressHandler() );
}

const nodeModulesToTranspile = [
	// general form is <package-name>/.
	// The trailing slash makes sure we're not matching these as prefixes
	// In some cases we do want prefix style matching (lodash. for lodash.assign)
	'@automattic/calypso-polyfills/',
	'@automattic/react-virtualized/',
	'@github/webauthn-json/',
	'acorn-jsx/',
	'chalk/',
	'd3-array/',
	'd3-scale/',
	'debug/',
	'escape-string-regexp/',
	'filesize/',
	'gridicons/',
	'prismjs/',
	'punycode/',
	'react-spring/',
	'regenerate-unicode-properties/',
	'regexpu-core/',
	'striptags/',
	'unicode-match-property-ecmascript/',
	'unicode-match-property-value-ecmascript/',
];

/**
 * Check to see if we should transpile certain files in node_modules
 *
 * @param {string} filepath the path of the file to check
 * @returns {boolean} True if we should transpile it, false if not
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

	return nodeModulesToTranspile.some( modulePart => filepath.startsWith( modulePart, checkFrom ) );
}

module.exports = { cssNameFromFilename, IncrementalProgressPlugin, shouldTranspileDependency };
