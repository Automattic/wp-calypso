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

module.exports = { cssNameFromFilename };
