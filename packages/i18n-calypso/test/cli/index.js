/**
 * External dependencies
 */
var assert = require( 'assert' ),
	path = require( 'path' ),
	babel = require( 'babel-core' ),
	fs = require( 'fs' );

/**
 * Internal dependencies
 */
var glotpress = require( '../../cli' );

// generate whitelist file
var buildFiles, sourceFiles;

sourceFiles = [ 'examples/i18n-test-examples.jsx', 'examples/i18n-test-example-second-file.jsx' ].map( function( file ) {
	return path.join( __dirname, file );
} );

buildFiles = [ 'out/i18n-test-examples.js', 'out/i18n-test-example-second-file.js' ].map( function( file ) {
	return path.join( __dirname, file );
} );

function compileExamples( done ) {
	// We run babel to compile the files under examples folder to out folder.
	// This is because i18n is run on babel-generated files.
	// This process is done in a Makefile previously but we are getting rid of those so here it goes
	Promise.all( sourceFiles.map( function( sourcePath, index ) {
		return new Promise( function( resolve, reject ) {
			var options = {
				presets: [ 'react' ]
			};
			babel.transformFile( sourcePath, options, function( err, result ) {
				if ( err ) {
					return reject( err );
				}
				// Ensure there's out directory
				fs.mkdir( path.join( __dirname, 'out' ), function( mkdirErr ) {
					// If it exists already, all is well
					if ( mkdirErr && mkdirErr.code !== 'EEXIST' ) {
						return reject( mkdirErr );
					}
					fs.writeFile( buildFiles[ index ], result.code, function( writeErr ) {
						if ( writeErr ) {
							return reject( writeErr );
						}
						resolve();
					} );
				} );
			} );
		} );
	} ) ).then( function() { done(); }, done );
}

function cleanupExamples( done ) {
	// Cleanup
	Promise.all( buildFiles.map( function( buildPath ) {
		return new Promise( function( resolve, reject ) {
			fs.unlink( buildPath, function( err ) {
				if ( err ) {
					return reject( err );
				}
				resolve();
			} );
		} );
	} ) ).then( function() {
		fs.rmdir( path.join( __dirname, 'out' ), function( err ) {
			done( err );
		} );
	}, function( err ) {
		done( err );
	} );
}

/**
 * In these tests we are taking the translate requests from
 * examples/ and generating the corresponding php code and pot file
 * and saving it into output.php. We then check to make sure
 * the output file contains what we expect.
 */
describe( 'index', function() {
	before( function( done ) {
		// Work around occasional Circle CI slowness
		this.timeout( 0 );
		compileExamples( done );
	} );

	after( function( done ) {
		this.timeout( 0 );
		cleanupExamples( done );
	} );

	describe( 'POT', function() {
		var output;

		before( function() {
			output = glotpress( {
				projectName: 'i18nTest',
				inputPaths: buildFiles,
				format: 'POT',
				extras: [ 'date' ]
			} );
		} );

		it( 'should have all the default headers', function() {
			assert.notEqual( -1, output.indexOf( '"Project-Id-Version: _s i18nTest"\n' ) );
			assert.notEqual( -1, output.indexOf( '"Report-Msgid-Bugs-To:' ) );
			assert.notEqual( -1, output.indexOf( '"POT-Creation-Date:' ) );
			assert.notEqual( -1, output.indexOf( '"MIME-Version: 1.0"\n' ) );
			assert.notEqual( -1, output.indexOf( '"Content-Type: text/plain; charset=UTF-8"\n' ) );
			assert.notEqual( -1, output.indexOf( '"Content-Transfer-Encoding: 8bit"\n' ) );
			assert.notEqual( -1, output.indexOf( '"PO-Revision-Date:' ) );
			assert.notEqual( -1, output.indexOf( '"Last-Translator: FULL NAME <EMAIL@ADDRESS>"\n' ) );
			assert.notEqual( -1, output.indexOf( '"Language-Team: LANGUAGE <LL@li.org>"\n' ) );
		} );

		it( 'should create a simple translation', function() {
			assert.notEqual( -1, output.indexOf( 'msgid "My hat has three corners."\nmsgstr ""\n' ) );
		} );

		it( 'should create a plural translation', function() {
			assert.notEqual( -1, output.indexOf( 'msgid "My hat has three corners."\nmsgid_plural "My hats have three corners."\nmsgstr[0] ""\n' ) );
		} );

		it( 'should create a context translation', function() {
			assert.notEqual( -1, output.indexOf( 'msgctxt "verb"\nmsgid "post"\nmsgstr ""\n' ) );
			assert.notEqual( -1, output.indexOf( 'msgctxt "verb2"\nmsgid "post2"\nmsgstr ""\n' ) );
		} );

		it( 'should prepend a translator comment', function() {
			assert.notEqual( -1, output.indexOf( '#. draft saved date format, see http://php.net/date' ) );
		} );

		it( 'should pass through an sprintf as a regular translation', function() {
			assert.notEqual( -1, output.indexOf( 'msgid "Your city is %(city)s and your zip is %(zip)s."\nmsgstr ""\n' ) );
		} );

		it( 'should allow string concatenating with + operator', function() {
			assert.notEqual( -1, output.indexOf( 'msgid "This is a multi-line translation with \\$1mixed quotes\\$1 and mixed \'single quotes\'"\nmsgstr ""\n' ) );
		} );

		// we are updating the translate api for plurals to allow for:
		// i18n.translate( 'single', 'plural', options );
		// we will honor the prior syntax but raise a warning in the console
		it( 'should handle the new plural syntax', function() {
			assert.notEqual( -1, output.indexOf( 'msgid "single test"\nmsgid_plural "plural test"\nmsgstr[0] ""\n' ) );
		} );

		it( 'should include default translations for momentjs object', function() {
			assert.notEqual( -1, output.indexOf( 'msgctxt "momentjs format string (for LT)"\nmsgid "HH:mm"\nmsgstr ""\n' ) );
		} );

		it( 'should find translations from multiple files', function() {
			assert.notEqual( -1, output.indexOf( 'msgid "My test has two files."\nmsgstr ""\n' ) );
		} );

		it( 'should find options with a literal string key', function() {
			assert.notEqual( -1, output.indexOf( 'msgctxt "context with a literal string key"\nmsgid "The string key text"\nmsgstr ""\n' ) );
		} );
	} );

	describe( 'PHP', function() {
		var output;

		before( function() {
			output = glotpress( {
				projectName: 'i18nTest',
				inputPaths: buildFiles,
				phpArrayName: 'arrayName',
				format: 'PHP',
				extras: [ 'date' ]
			} );
		} );

		it( 'should open with a php opening tag', function() {
			assert.equal( 0, output.indexOf( '<?php' ) );
		} );

		it( 'should create an array with the passed-in name', function() {
			assert.notEqual( -1, output.indexOf( '$arrayName = array(\n' ) );
		} );

		it( 'should create a simple __() translation', function() {
			assert.notEqual( -1, output.indexOf( '__( \'My hat has three corners.\' ),' ) );
		} );

		it( 'should create a plural _n() translation', function() {
			assert.notEqual( -1, output.indexOf( '_n( \'My hat has three corners.\', \'My hats have three corners.\', 1 ),' ) );
		} );

		it( 'should create a context _x() translation', function() {
			assert.notEqual( -1, output.indexOf( '_x( \'post\', \'verb\' ),' ) );
		} );

		it( 'should allow `original` as initial string', function() {
			assert.notEqual( -1, output.indexOf( '_x( \'post2\', \'verb2\' ),' ) );
		} );

		it( 'should prepend a translator comment', function() {
			assert.notEqual( -1, output.indexOf( '/* translators: draft saved date format, see http://php.net/date */\n__( \'g:i:s a\' ),' ) );
		} );

		it( 'should pass through an sprintf as a regular __() method', function() {
			assert.notEqual( -1, output.indexOf( '__( \'Your city is %(city)s and your zip is %(zip)s.\' ),' ) );
		} );

		it( 'should allow string concatenating with + operator', function() {
			assert.notEqual( -1, output.indexOf( '__( \'This is a multi-line translation with "mixed quotes" and mixed \\\'single quotes\\\'\' ),' ) );
		} );

		// we are updating the translate api for plurals to allow for:
		// i18n.translate( 'single', 'plural', options );
		// we will honor the prior syntax but raise a warning in the console
		it( 'should handle the new plural syntax', function() {
			assert.notEqual( -1, output.indexOf( '_n( \'single test\', \'plural test\', 1 ),' ) );
		} );

		it( 'should allow a variable placeholder for `count`', function() {
			assert.notEqual( -1, output.indexOf( '_n( \'single test2\', \'plural test2\', 1 ),' ) );
		} );

		it( 'should include default translations for momentjs object', function() {
			assert.notEqual( -1, output.indexOf( '_x( \'HH:mm\', \'momentjs format string (for LT)\' )' ) );
		} );

		it( 'should close the php array', function() {
			assert.notEqual( -1, output.indexOf( '\n);' ) );
		} );

		it( 'should find translations from multiple files', function() {
			assert.notEqual( -1, output.indexOf( '__( \'My test has two files.\' ),' ) );
		} );

		it( 'should find options with a literal string key', function() {
			assert.notEqual( -1, output.indexOf( 'context with a literal string key' ) );
		} );
	} );
} );
