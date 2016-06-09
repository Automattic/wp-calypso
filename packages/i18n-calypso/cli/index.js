/**
 * Module dependencies/
 */
var fs = require( 'fs' ),
	path = require( 'path' ),
	Xgettext = require( 'xgettext-js' ),
	preProcessXGettextJSMatch = require( './preprocess-xgettextjs-match.js' ),
	formatters = require( './formatters' ),
	concatAllFiles = require( './util' ).concatAllFiles,
	debug = require( 'debug' )( 'glotpress-js' );

module.exports = function( config ) {
	var keywords,
		data,
		extraFiles,
		matches,
		parser,
		parserKeywords,
		formatter,
		textOutput;

	keywords = config.keywords || [ 'translate' ];
	formatter = ( config.format || 'pot' ).toLowerCase();

	if ( ! config.data && ! config.inputPaths ) {
		throw new Error( 'Must provide input `data` or `inputPaths`' );
	}

	// TODO: parse input files one after the other to improve memory perfomance
	// and have the file location of each i18n string
	data = config.data || concatAllFiles( config.inputPaths );

	if ( config.extras ) {
		extraFiles = config.extras.map( function( extra ) {
			return path.join( __dirname, 'extras', extra + '.js' );
		} );
		data += '\n' + concatAllFiles( extraFiles );
	}

	parserKeywords = config.parserKeywords || {};

	if ( keywords ) {
		parserKeywords = keywords.reduce( function( output, currentKeyword ) {
			output[ currentKeyword ] = preProcessXGettextJSMatch;
			return output;
		}, parserKeywords );
	}

	parser = new Xgettext( {
		keywords: parserKeywords
	} );

	matches = parser.getMatches( data );

	debug( 'matches', matches );

	if ( 'string' === typeof formatter ) {
		formatter = formatters[ formatter ];
	}

	if ( ! formatter ) {
		throw new Error( 'Formatter not found : ' + config.formatter );
	}

	textOutput = formatter( matches, config );

	if ( config.output ) {
		fs.writeFileSync( config.output, textOutput, 'utf8' );
	}

	return textOutput;
};
