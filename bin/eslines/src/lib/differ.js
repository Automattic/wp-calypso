/* eslint strict: "off" */

'use strict';

module.exports = function( diff ) {
	/*
	* This function returns a structure out of a git diff
	* with the filenames and lines modified.
	*
	* returns {
	* 'fileName': [1],
	* 'fileName2': [2]
	* }
	*
	*/

	const files = {};
	if ( ! diff ) {
		return files;
	}

	const lines = diff.split( '\n' );
	let currentFile;
	lines.forEach( line => {
		if ( line.startsWith( 'diff --git' ) ) {
			currentFile = getFile( line );
			files[ currentFile ] = [];
		} else if ( line.startsWith( '@@' ) ) {
			getLineNumbers( line ).forEach( lineNumber => {
				files[ currentFile ].push( lineNumber );
			} );
		}
	} );

	function getFile( strLine ) {
		/*
		*
		* See https://git-scm.com/docs/git-diff
		*
		* ex: diff --git a/file1 b/file2diff
		*
		* The a/ and b/ filenames are the same unless rename/copy is involved.
		* Especially, even for a creation or a deletion,
		* /dev/null is not used in place of the a/ or b/ filenames.
		*
		* When rename/copy is involved, file1 and file2 show
		* the name of the source file of the rename/copy and
		* the name of the file that rename/copy produces, respectively.
		*
		* We expect a/ and b/ to be complete paths, which can be achieved
		* by using --src-prefix and --dst-prefix.
		*
		*/
		return strLine.split( ' ' )[ 3 ];
	}

	function getLineNumbers( strLine ) {
		/* eslint-disable */
		// disable max-len rule due to long URI
		/*
		*
		* See https://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html#Detailed-Unified
		*
		* ex: @@ -65,3 +65,3 @@ module.exports = {
		*
		* 65 is the starting point, 3 the number of lines affected,
		* so we should return [ 65, 66, 67 ]
		*
		*/
		/* eslint-enable */
		const lineNumbers = [];
		const lineRange = strLine.split( ' ' )[ 2 ].split( ',' );
		const start = +lineRange[ 0 ].slice( 1 );
		let counter = lineRange.length > 1 ? lineRange[ 1 ] : 1;
		while ( counter > 0 ) {
			counter--;
			lineNumbers.push( start + counter );
		}
		return lineNumbers;
	}

	return files;
};
