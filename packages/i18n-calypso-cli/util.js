const fs = require( 'fs' );

/**
 * Reads a list of files and joins their contents together with newlines
 * @param  {Array<string>} inputFiles Paths of the files to parse
 * @returns {string}                   Concatenated file contents
 */
function concatAllFiles( inputFiles ) {
	return inputFiles.map( ( inputFile ) => fs.readFileSync( inputFile, 'utf8' ) ).join( '\n' );
}

module.exports = {
	concatAllFiles,
};
