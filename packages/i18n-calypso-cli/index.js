/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const Xgettext = require( 'xgettext-js' );
const debug = require( 'debug' )( 'i18n-calypso' );

/**
 * Internal dependencies
 */
const preProcessXGettextJSMatch = require( './preprocess-xgettextjs-match.js' );
const formatters = require( './formatters' );

module.exports = function i18nCalypso( config ) {
	const keywords = config.keywords || [ 'translate' ];

	if ( ! config.data && ! config.inputPaths ) {
		throw new Error( 'Must provide input `data` or `inputPaths`' );
	}

	let parserKeywords = config.parserKeywords || {};

	if ( keywords ) {
		parserKeywords = keywords.reduce( function ( output, currentKeyword ) {
			output[ currentKeyword ] = preProcessXGettextJSMatch;
			return output;
		}, parserKeywords );
	}

	const parser = new Xgettext( {
		keywords: parserKeywords,
		parseOptions: {
			plugins: [
				'asyncFunctions',
				'classProperties',
				'dynamicImport',
				'exportDefaultFrom',
				'exportExtensions',
				'exportNamespaceFrom',
				'jsx',
				'objectRestSpread',
				'trailingFunctionCommas',
				'typescript',
				'nullishCoalescingOperator',
				'optionalChaining',
			],
			allowImportExportEverywhere: true,
		},
	} );

	function getFileMatches( inputFiles ) {
		return inputFiles.map( ( inputFile ) => {
			debug( 'Parsing inputFile: ' + inputFile );
			const relativeInputFilePath = path.relative( __dirname, inputFile ).replace( /^[/.]+/, '' );
			return parser.getMatches( fs.readFileSync( inputFile, 'utf8' ) ).map( ( match ) => {
				match.line = relativeInputFilePath + ':' + match.line;
				return match;
			} );
		} );
	}

	let matches;
	if ( config.data ) {
		// If data is provided, feed it directly to the parser and call the file <unknown>
		matches = [
			parser.getMatches( config.data ).map( function ( match ) {
				match.location = '<unknown>:' + match.line;
				return match;
			} ),
		];
	} else {
		matches = getFileMatches( config.inputPaths, config.lines );
	}

	if ( config.extras ) {
		matches = matches.concat(
			getFileMatches(
				config.extras.map( function ( extra ) {
					return path.join( __dirname, 'extras', extra + '.js' );
				} )
			)
		);
	}

	// The matches array now contains the entries for each file in it's own array:
	// [ [ 'file1 match1', 'file1 match2' ], [ 'file2 match1' ] ]

	// Flatten array, so that it has all entries in just one level.
	matches = [].concat.apply( [], matches );

	if ( config.lines ) {
		matches = matches.filter( function ( match ) {
			const line = match.line.split( ':' );
			return (
				'undefined' !== typeof config.lines[ line[ 0 ] ] &&
				-1 !== config.lines[ line[ 0 ] ].indexOf( line[ 1 ] )
			);
		} );
	}

	let formatter = ( config.format || 'pot' ).toLowerCase();

	if ( 'string' === typeof formatter ) {
		formatter = formatters[ formatter ];
	}

	if ( ! formatter ) {
		throw new Error( 'Formatter not found : ' + config.formatter );
	}

	const textOutput = formatter( matches, config );

	if ( config.output ) {
		fs.writeFileSync( config.output, textOutput, 'utf8' );
	}

	return textOutput;
};
