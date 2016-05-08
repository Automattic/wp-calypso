/**
 * External dependencies
 */
var assert = require( 'assert' ),
	path = require( 'path' ),
	babel = require( 'babel' ),
	fs = require( 'fs' );

/**
 * Internal dependencies
 */
var i18n = require( '../' );

// generate whitelist file
var outputFile = path.join( __dirname, 'output.php' ),
	output, buildFiles, sourceFiles;

sourceFiles = [ 'examples/i18n-test-examples.jsx', 'examples/i18n-test-example-second-file.jsx' ].map( function( file ) {
	return path.join( __dirname, file );
} );

buildFiles = [ 'out/i18n-test-examples.js', 'out/i18n-test-example-second-file.js' ].map( function( file ) {
	return path.join( __dirname, file );
} );

/**
 * In these tests we are taking the translate requests from
 * examples.js and generating the corresponding wpcom code
 * and saving it into output.php. We then check to make sure
 * the output file contains what we expect.
 */
describe( 'index', function() {
	before( function( done ) {
		// Work around occasional Circle CI slowness
		this.timeout( 0 );
		// We run babel to compile the files under examples folder to out folder.
		// This is because i18n is run on babel-generated files.
		// This process is done in a Makefile previously but we are getting rid of those so here it goes
		Promise.all( sourceFiles.map( function( sourcePath, index ) {
			return new Promise( function( resolve, reject ) {
				babel.transformFile( sourcePath, function( err, result ) {
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
		} ) ).then( function() {
			// Babel finished
			i18n( outputFile, 'arrayName', buildFiles, function() {
				fs.readFile( outputFile, 'utf8', function( err, data ) {
					output = data;
					done( err );
				} );
			} );
		}, function( error ) {
			done( error );
		} );
	} );

	after( function( done ) {
		this.timeout( 0 );
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

	it( 'should include default translations for number formatting strings', function() {
		assert.notEqual( -1, output.indexOf( '// Number formatting strings' ) );
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
