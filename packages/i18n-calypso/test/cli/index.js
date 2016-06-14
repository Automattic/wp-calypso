/**
 * External dependencies
 */
var expect = require( 'chai' ).expect,
	path = require( 'path' ),
	babel = require( 'babel-core' ),
	fs = require( 'fs'),
	rewire = require( 'rewire' );

/**
 * Internal dependencies
 */
var i18nCalypsoCLI = require( '../../cli' );

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

	describe( 'POT helpers', function() {
		describe( '#multiline()', function() {
			var multiline = rewire( '../../cli/formatters/pot.js' ).__get__( 'multiline' );

			it( 'should not split a short literal into multiple lines', function() {
				var literal = '"Lorem ipsum dolor sit amet"';
				expect( multiline( literal ) ).to.equal( '"Lorem ipsum dolor sit amet"' );
			} );

			it( 'should split a long literal into multiple lines', function() {
				// normal text
				var literal1 = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."';
				expect( multiline( literal1 ) ).to.equal( [
					'""',
					'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
					'"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, "',
					'"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo "',
					'"consequat."'
				].join( '\n' ) );

				// long words
				var literal2 = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniamquisnostrudexercitationullamco laborisnisiutaliquipexeacommodo consequat."';
				expect( multiline( literal2 ) ).to.equal( [
					'""',
					'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
					'"temporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniamquisnostrudexercitationullamco "',
					'"laborisnisiutaliquipexeacommodo consequat."'
				].join( '\n' ) );

				// 1 line just longer than 79 characters
				var literal3 = '"If you’re looking to paste rich content from Microsoft Word, try turning this option off. The editor will clean up text pasted from Word automatically."';
				expect( multiline( literal3 ) ).to.equal( [
					'""',
					'"If you’re looking to paste rich content from Microsoft Word, try turning "',
					'"this option off. The editor will clean up text pasted from Word "',
					'"automatically."'
				].join( '\n' ) );

				// 2 lines of 78 characters
				var literal4 = '"The registry for your domains requires a special process for transfers. Our Happiness Engineers have been notified about your transfer request. Tnk you."';
				expect( multiline( literal4 ) ).to.equal( [
					'""',
					'"The registry for your domains requires a special process for transfers. Our "',
					'"Happiness Engineers have been notified about your transfer request. Tnk you."'
				].join( '\n' ) );

				// A space after 79 characters
				var literal5 = '"%d file could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support."';
				expect( multiline( literal5 ) ).to.equal( [
					'""',
					'"%d file could not be uploaded because your site does not support video "',
					'"files. Upgrade to a premium plan for video support."'
				].join( '\n' ) );

				// short words
				var literal6 = '"a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9. a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9."';
				expect( multiline( literal6 ) ).to.equal( [
					'""',
					'"a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9. a b "',
					'"c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9."'
				].join( '\n' ) );
			} );

			it( 'should add an empty line first if the literal can fit on one line without the prefix', function() {
				var literal = '"There is an issue connecting to %s. {{button}}Reconnect {{icon/}}{{/button}}"';
				expect( multiline( literal ) ).to.equal( [
					'""',
					'"There is an issue connecting to %s. {{button}}Reconnect {{icon/}}{{/button}}"'
				].join( '\n' ) );
			} );

			it( 'should not add an empty line if the literal length is less or equal to 73 characters (79 - lengthOf("msgid "))', function() {
				var literal = '"Testimonials are not enabled. Open your site settings to activate them."';
				expect( multiline( literal ) ).to.equal( '"Testimonials are not enabled. Open your site settings to activate them."' );
			} );

			it( 'should split text on a /', function() {
				var literal = '"{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/emailPreferences}}"';
				expect( multiline( literal ) ).to.equal( [
					'""',
					'"{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/"',
					'"emailPreferences}}"'
				].join( '\n' ) );
			} );

			it( 'should work with longer prefixes', function() {
				var literal = '"Categories: info popover text shown when creating a new category and selecting a parent category."';
				expect( multiline( literal, 'msgctxt ' ) ).to.equal( [
					'""',
					'"Categories: info popover text shown when creating a new category and "',
					'"selecting a parent category."'
				].join( '\n' ) );
			} );

			it( 'should work with very long words', function() {
				var literal = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamco laborisnisiutaliquipexeacommodo consequat."';
				expect( multiline( literal ) ).to.equal( [
					'""',
					'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
					'"temporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamco "',
					'"laborisnisiutaliquipexeacommodo consequat."'
				].join( '\n' ) );
			} );
		} );
	} );

	describe( 'POT', function() {
		var output;

		before( function() {
			output = i18nCalypsoCLI( {
				projectName: 'i18nTest',
				inputPaths: buildFiles,
				format: 'POT',
				extras: [ 'date' ]
			} );
		} );

		it( 'should have all the default headers', function() {
			expect( output ).to.have.string( '"Project-Id-Version: _s i18nTest"\n' );
			expect( output ).to.have.string( '"Report-Msgid-Bugs-To:' );
			expect( output ).to.have.string( '"POT-Creation-Date:' );
			expect( output ).to.have.string( '"MIME-Version: 1.0"\n' );
			expect( output ).to.have.string( '"Content-Type: text/plain; charset=UTF-8"\n' );
			expect( output ).to.have.string( '"Content-Transfer-Encoding: 8bit"\n' );
			expect( output ).to.have.string( '"PO-Revision-Date:' );
			expect( output ).to.have.string( '"Last-Translator: FULL NAME <EMAIL@ADDRESS>"\n' );
			expect( output ).to.have.string( '"Language-Team: LANGUAGE <LL@li.org>"\n' );
		} );

		it( 'should create a simple translation', function() {
			expect( output ).to.have.string( 'msgid "My hat has three corners."\nmsgstr ""\n' );
		} );

		it( 'should create a plural translation', function() {
			expect( output ).to.have.string( 'msgid "My hat has three corners."\nmsgid_plural "My hats have three corners."\nmsgstr[0] ""\n' );
		} );

		it( 'should create a context translation', function() {
			expect( output ).to.have.string( 'msgctxt "verb"\nmsgid "post"\nmsgstr ""\n' );
			expect( output ).to.have.string( 'msgctxt "verb2"\nmsgid "post2"\nmsgstr ""\n' );
		} );

		it( 'should prepend a translator comment', function() {
			expect( output ).to.have.string( '#. draft saved date format, see http://php.net/date' );
		} );

		it( 'should pass through an sprintf as a regular translation', function() {
			expect( output ).to.have.string( 'msgid "Your city is %(city)s and your zip is %(zip)s."\nmsgstr ""\n' );
		} );

		it( 'should allow string concatenating with + operator', function() {
			expect( output ).to.have.string( [
				'msgid ""',
				'"This is a multi-line translation with \\"mixed quotes\\" and mixed \'single "',
				'"quotes\'"',
				'msgstr ""'
			].join( '\n' ) );
		} );

		// we are updating the translate api for plurals to allow for:
		// i18n.translate( 'single', 'plural', options );
		// we will honor the prior syntax but raise a warning in the console
		it( 'should handle the new plural syntax', function() {
			expect( output ).to.have.string( 'msgid "single test"\nmsgid_plural "plural test"\nmsgstr[0] ""\n' );
		} );

		it( 'should include default translations for number formatting strings', function() {
			expect( output ).to.have.string( 'msgid "number_format_thousands_sep"\n' );
			expect( output ).to.have.string( 'msgid "number_format_decimal_point"\n' );
		} );

		it( 'should find translations from multiple files', function() {
			expect( output ).to.have.string( 'msgid "My test has two files."\nmsgstr ""\n' );
		} );

		it( 'should find options with a literal string key', function() {
			expect( output ).to.have.string( 'msgctxt "context with a literal string key"\nmsgid "The string key text"\nmsgstr ""\n' );
		} );
	} );

	describe( 'PHP', function() {
		var output;

		before( function() {
			output = i18nCalypsoCLI( {
				projectName: 'i18nTest',
				inputPaths: buildFiles,
				phpArrayName: 'arrayName',
				format: 'PHP',
				extras: [ 'date' ]
			} );
		} );

		it( 'should open with a php opening tag', function() {
			expect( output ).to.have.string( '<?php' );
		} );

		it( 'should create an array with the passed-in name', function() {
			expect( output ).to.have.string( '$arrayName = array(\n' );
		} );

		it( 'should create a simple __() translation', function() {
			expect( output ).to.have.string( '__( "My hat has three corners." ),' );
		} );

		it( 'should create a plural _n() translation', function() {
			expect( output ).to.have.string( '_n( "My hat has three corners.", "My hats have three corners.", 1 ),' );
		} );

		it( 'should create a context _x() translation', function() {
			expect( output ).to.have.string( '_x( "post", "verb" ),' );
		} );

		it( 'should allow `original` as initial string', function() {
			expect( output ).to.have.string( '_x( "post2", "verb2" ),' );
		} );

		it( 'should prepend a translator comment', function() {
			expect( output ).to.have.string( '/* translators: draft saved date format, see http://php.net/date */\n__( "g:i:s a" ),' );
		} );

		it( 'should pass through an sprintf as a regular __() method', function() {
			expect( output ).to.have.string( '__( "Your city is %(city)s and your zip is %(zip)s." ),' );
		} );

		it( 'should allow string concatenating with + operator', function() {
			expect( output ).to.have.string( '__( "This is a multi-line translation with \\"mixed quotes\\" and mixed \'single quotes\'" ),' );
		} );

		// we are updating the translate api for plurals to allow for:
		// i18n.translate( 'single', 'plural', options );
		// we will honor the prior syntax but raise a warning in the console
		it( 'should handle the new plural syntax', function() {
			expect( output ).to.have.string( '_n( "single test", "plural test", 1 ),' );
		} );

		it( 'should allow a variable placeholder for `count`', function() {
			expect( output ).to.have.string( '_n( "single test2", "plural test2", 1 ),' );
		} );

		it( 'should include default translations for momentjs object', function() {
			expect( output ).to.have.string( '__( "number_format_thousands_sep" ),' );
			expect( output ).to.have.string( '__( "number_format_decimal_point" ),' );
		} );

		it( 'should close the php array', function() {
			expect( output ).to.have.string( '\n);' );
		} );

		it( 'should find translations from multiple files', function() {
			expect( output ).to.have.string( '__( "My test has two files." ),' );
		} );

		it( 'should find options with a literal string key', function() {
			expect( output ).to.have.string( 'context with a literal string key' );
		} );
	} );
} );
