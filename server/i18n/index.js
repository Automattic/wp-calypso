#!/usr/bin/env node

/**
 * Module dependencies/
 */
var async = require( 'async' ),
	fs = require( 'fs' ),
	Xgettext = require( 'xgettext-js' ),
	preProcessXGettextJSMatch = require( './preprocess-xgettextjs-match.js' ),
	parser;

// parser object that buids a WordPress php string for every
// occurence of `translate()` in a file
parser = new Xgettext( {
	keywords: {
		translate: function( match ) {
			var finalProps = preProcessXGettextJSMatch( match );

			if ( ! finalProps ) {
				return; // invalid input, skip this match
			}
			return buildWordPressString( finalProps );
		},
	}
} );

/**
 * Determine the correct WP i18n function to use based on the input:
 * __(), _n(), _nx(), _x()
 * @param  {object} properties - properties describing translation request
 * @return {string}            returns the function name
 */
function getWordPressFunction( properties ) {
	var wpFunc = [ '_' ];

	if ( properties.plural ) {
		wpFunc.push( 'n' );
	}
	if ( properties.context ) {
		wpFunc.push( 'x' );
	}

	wpFunc = wpFunc.join( '' );

	if ( 1 === wpFunc.length ) {
		return '__';
	}

	return wpFunc;
}

/**
 * Generate each line of equivalent php from a matching `translate()`
 * request found in the client code
 * @param  {object} properties - properties describing translation request
 * @return {string}            the equivalent php code for each translation request
 */
function buildWordPressString( properties ) {
	var wpFunc = getWordPressFunction( properties ),
		response = [],
		stringFromFunc = {
			__: '\n__( ' + properties.single + ' ),',
			_x: '\n_x( ' + [ properties.single, properties.context ].join( ', ' ) + ' ),',
			_nx: '\n_nx( ' + [ properties.single, properties.plural, properties.count, properties.context ].join( ', ' ) + ' ),',
			_n: '\n_n( ' + [ properties.single, properties.plural, properties.count ].join( ', ' ) + ' ),'
		};

	// translations with comments get a preceding comment in the php code
	if ( properties.comment ) {
		// replace */ with *\/ to prevent translators from accidentally running arbitrary code
		response.push( '\n/* translators: ' + properties.comment.replace( /\*\//g, '*\\/' ) + ' */' );
	}

	response.push( stringFromFunc[ wpFunc ] );

	return response.join( '' );
}

/**
 * Takes read file and generates a string representation of a file with
 * equivalent WordPress-style translate functions. Also prepends with some
 * necessary time and number translations.
 *
 * @param  {array} data        - the input file as read in by fs.readFile()
 * @param  {string} arrayName  - name of the array in the php resulting php file
 * @return {string}            - string representation of the final php file
 */
function buildPhpOutput( data, arrayName ) {
	// find matching instances of `translate()` and generate corresponding php output
	var matches = parser.getMatches( data );

	matches = matches.map( function( match ) {
		return match.string;
	} );

	// prepend the matches array with this content to open the php file
	matches.unshift( [
		'<?php',
		'\n/* THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY. SEE https://github.com/Automattic/wp-calypso/tree/master/server/i18n */',
		'\n$' + arrayName + ' = array('
	].join( '' ) );

	// append the matches array with this content to close the php file
	matches.push( [
		'\n\n// Date/time strings for localisation',
		'\n_x( "in %s", "future time" ),',
		'\n__( "a few seconds" ),',
		'\n__( "a minute" ),',
		'\n__( "%d minutes" ),',
		'\n__( "%d hours" ),',
		'\n__( "%d days" ),',
		'\n__( "a month" ),',
		'\n__( "%d months" ),',
		'\n__( "a year" ),',
		'\n__( "%d years" ),',
		'\n\n// Momentjs formatting strings',

		'\n\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "HH:mm", "momentjs format string (for LT)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "DD/MM/YYYY", "momentjs format string (for L)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "D MMMM YYYY", "momentjs format string (for LL)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "D MMMM YYYY LT", "momentjs format string (for LLL)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "dddd, D MMMM YYYY LT", "momentjs format string (for LLLL)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "MMM D", "momentjs format string (for MMM D)" ),',

		'\n\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "[Today at] LT", "momentjs format string (sameDay)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "[Tomorrow at] LT", "momentjs format string (nextDay)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "dddd [at] LT", "momentjs format string (nextWeek)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "[Yesterday at] LT", "momentjs format string (lastDay)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "[Last] dddd [at] LT", "momentjs format string (lastWeek)" ),',
		'\n/* translators: Moment.js formatting string, see http://momentjs.com/docs/#/displaying/format/ and https://github.com/moment/moment/blob/develop/locale/en-gb.js, surround non-variable text with square brackets */',
		'\n_x( "L", "momentjs format string (sameElse)" ),',

		'\n\n/* translators: Number representing the first day of the week, 0=Sunday, 1=Monday, etc. Should match typical region formats for the most prominent region where the language is spoken. */',
		'\n_x( "num_first_day_of_week", "momentjs setting" ),',
		'\n/* translators: The week that contains Jan (X) is the first week of the year, e.g., `4` means Jan 4. Different regions start counting weeks with different rules, check Wikipedia to be sure. */',
		'\n_x( "num_day_of_year", "momentjs setting" ),',
		'\n);\n'
	].join( '' ) );

	// append the generated file comment to the bottom of the array as well
	matches.push( '\n/* THIS IS THE END OF THE GENERATED FILE */' );

	return matches.join( '' );
}

/**
 * Reads the inputFile and generates a php outputFile with equivalent php translation functions.

 * @param  {string}   outputFile - location to save the resulting output file
 * @param  {string}   arrayName  - name of array to use inside php file
 * @param  {string}   inputFiles  - location of the javascript file to parse
 * @param  {Function} done       - callback function
 */
function readFile( outputFile, arrayName, inputFiles, done ) {
	console.log( 'Reading inputFiles: ' + inputFiles.join( ', ' ) );
	async.map( inputFiles, function( inputFile, callback ) {
		fs.readFile( inputFile, 'utf8', function( err, data ) {
			if ( err ) {
				console.log( 'i18n: Error reading ' + inputFile );
				callback( err );
			} else {
				callback( null, data );
			}
		} );
	}, function( err, data ) {
		if ( err ) {
			return console.log( err );
		}
		fs.writeFile( outputFile, buildPhpOutput( data.join( '\n' ), arrayName ), 'utf8', function( error ) {
			if ( error ) {
				console.log( error );
			} else {
				console.log( 'get-i18n completed' );
				if ( 'function' === typeof done ) {
					done();
				}
			}
		} );
	} );
}

module.exports = readFile;
