const fs = require( 'fs' );
const path = require( 'path' );
const { po } = require( 'gettext-parser' );
const glob = require( 'glob' );
const merge = require( 'lodash.mergewith' );

const mergeDeep = ( left, right, key ) => {
	if ( typeof left === 'object' && typeof right === 'object' ) {
		return merge( left, right, mergeDeep );
	}

	if ( typeof left === 'undefined' ) {
		return right;
	}

	if ( key === 'reference' ) {
		const leftReferences = ( left || '' ).split( '\n' );
		const rightReferences = ( right || '' ).split( '\n' );

		return leftReferences.concat( rightReferences ).join( '\n' );
	}

	if ( key === 'extracted' && left.length && right.length && left !== right ) {
		return left + '\n' + right;
	}

	return right || left;
};

/**
 * Filter translations from POT data object by reference lines.
 *
 * @param   {Object} potData POT data object
 * @param   {string} linesFilterFile File path to JSON file with files and line numbers.
 * @returns {void}
 */
const filterByLines = ( potData, linesFilterFile ) => {
	let lines;

	try {
		lines = JSON.parse( fs.readFileSync( linesFilterFile, 'utf8' ) );
	} catch ( error ) {
		console.error( 'Failed to line filter file: ', error );
	}

	if ( typeof lines === 'undefined' || typeof potData.translations === 'undefined' ) {
		return;
	}

	potData.translations = Object.keys( potData.translations ).reduce( ( acc, context ) => {
		for ( const key in potData.translations[ context ] ) {
			const entry = potData.translations[ context ][ key ];
			const refs =
				entry.comments && entry.comments.reference && entry.comments.reference.split( '\n' );

			if ( ! refs ) {
				continue;
			}

			const shouldPass = refs.some( ( ref ) => {
				const [ file, line ] = ref.split( ':' );

				return lines[ file ] && lines[ file ].indexOf( parseInt( line ) ) >= 0;
			} );

			if ( ! shouldPass ) {
				continue;
			}

			if ( typeof acc[ context ] === 'undefined' ) {
				acc[ context ] = {};
			}

			acc[ context ][ key ] = entry;
		}

		return acc;
	}, {} );
};

const WARNING_COMMENT_START = '# THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY.\n\n';
const WARNING_COMMENT_END = '\n\n# THIS IS THE END OF THE GENERATED FILE.';
const addWarningComments = ( fileContent ) =>
	''.concat( WARNING_COMMENT_START, fileContent, WARNING_COMMENT_END );

module.exports = ( dir, output, linesFilter ) => {
	const potGlob = path.resolve( dir, '*.pot' );
	const potFiles = glob.sync( potGlob, { nodir: true, absolute: true } );

	const concatPOT = potFiles.reduce( ( acc, filePath ) => {
		return mergeDeep( acc, po.parse( fs.readFileSync( filePath, 'utf8' ) ) );
	}, {} );

	// Apply filter by reference lines if presented
	if ( typeof linesFilter !== 'undefined' ) {
		filterByLines( concatPOT, linesFilter );
	}

	const potFileContent = addWarningComments( po.compile( concatPOT ) );
	fs.writeFileSync( output, potFileContent );
};
