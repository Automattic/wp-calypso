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

module.exports = { cssNameFromFilename, IncrementalProgressPlugin };
