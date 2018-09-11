/**
 * External dependencies
 */
let expect = require( 'chai' ).expect,
	path = require( 'path' ),
	fs = require( 'fs'),
	rewire = require( 'rewire' );

/**
 * Internal dependencies
 */
const i18nCalypsoCLI = require( '../../cli' );

// generate whitelist file
let sourceFiles;

sourceFiles = [ 'examples/i18n-test-examples.jsx', 'examples/i18n-test-example-second-file.jsx' ].map( function( file ) {
	return path.join( __dirname, file );
} );

/**
 * In these tests we are taking the translate requests from
 * examples/ and generating the corresponding php code and pot file
 * and saving it into output.php. We then check to make sure
 * the output file contains what we expect.
 */
describe( 'index', function() {
	describe( 'POT helpers', function() {
		describe( '#multiline()', function() {
			const multiline = rewire( '../../cli/formatters/pot.js' ).__get__( 'multiline' );

			it( 'should not split a short literal into multiple lines', function() {
				const literal = '"Lorem ipsum dolor sit amet"';
				expect( multiline( literal ) ).to.equal( '"Lorem ipsum dolor sit amet"' );
			} );

			it( 'should split a long literal into multiple lines', function() {
				// normal text
				const literal1 = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."';
				expect( multiline( literal1 ) ).to.equal( [
					'""',
					'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
					'"tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, "',
					'"quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo "',
					'"consequat."'
				].join( '\n' ) );

				// long words
				const literal2 = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniamquisnostrudexercitationullamco laborisnisiutaliquipexeacommodo consequat."';
				expect( multiline( literal2 ) ).to.equal( [
					'""',
					'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
					'"temporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniamquisnostrudexercitationullamco "',
					'"laborisnisiutaliquipexeacommodo consequat."'
				].join( '\n' ) );

				// 1 line just longer than 79 characters
				const literal3 = '"If you’re looking to paste rich content from Microsoft Word, try turning this option off. The editor will clean up text pasted from Word automatically."';
				expect( multiline( literal3 ) ).to.equal( [
					'""',
					'"If you’re looking to paste rich content from Microsoft Word, try turning "',
					'"this option off. The editor will clean up text pasted from Word "',
					'"automatically."'
				].join( '\n' ) );

				// 2 lines of 78 characters
				const literal4 = '"The registry for your domains requires a special process for transfers. Our Happiness Engineers have been notified about your transfer request. Tnk you."';
				expect( multiline( literal4 ) ).to.equal( [
					'""',
					'"The registry for your domains requires a special process for transfers. Our "',
					'"Happiness Engineers have been notified about your transfer request. Tnk you."'
				].join( '\n' ) );

				// A space after 79 characters
				const literal5 = '"%d file could not be uploaded because your site does not support video files. Upgrade to a premium plan for video support."';
				expect( multiline( literal5 ) ).to.equal( [
					'""',
					'"%d file could not be uploaded because your site does not support video "',
					'"files. Upgrade to a premium plan for video support."'
				].join( '\n' ) );

				// short words
				const literal6 = '"a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9. a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9."';
				expect( multiline( literal6 ) ).to.equal( [
					'""',
					'"a b c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9. a b "',
					'"c d e f g h i j k l m n o p q r s t u v w x y z 0 1 2 3 4 5 6 7 8 9."'
				].join( '\n' ) );
			} );

			it( 'should add an empty line first if the literal can fit on one line without the prefix', function() {
				const literal = '"There is an issue connecting to %s. {{button}}Reconnect {{icon/}}{{/button}}"';
				expect( multiline( literal ) ).to.equal( [
					'""',
					'"There is an issue connecting to %s. {{button}}Reconnect {{icon/}}{{/button}}"'
				].join( '\n' ) );
			} );

			it( 'should not add an empty line if the literal length is less or equal to 73 characters (79 - lengthOf("msgid "))', function() {
				const literal = '"Testimonials are not enabled. Open your site settings to activate them."';
				expect( multiline( literal ) ).to.equal( '"Testimonials are not enabled. Open your site settings to activate them."' );
			} );

			it( 'should split text on a /', function() {
				const literal = '"{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/emailPreferences}}"';
				expect( multiline( literal ) ).to.equal( [
					'""',
					'"{{wrapper}}%(email)s{{/wrapper}} {{emailPreferences}}change{{/"',
					'"emailPreferences}}"'
				].join( '\n' ) );
			} );

			it( 'should work with longer prefixes', function() {
				const literal = '"Categories: info popover text shown when creating a new category and selecting a parent category."';
				expect( multiline( literal, 'msgctxt ' ) ).to.equal( [
					'""',
					'"Categories: info popover text shown when creating a new category and "',
					'"selecting a parent category."'
				].join( '\n' ) );
			} );

			it( 'should work with very long words', function() {
				const literal = '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamco laborisnisiutaliquipexeacommodo consequat."';
				expect( multiline( literal ) ).to.equal( [
					'""',
					'"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "',
					'"temporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamco "',
					'"laborisnisiutaliquipexeacommodo consequat."'
				].join( '\n' ) );
			} );

			it( 'should not break very long line without separators', function() {
				const literal = '"LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequat."';
				expect( multiline( literal ) ).to.equal( [
					'""',
					'"LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequat."'
				].join( '\n' ) );
			} );
		} );
	} );

	describe( 'POT', function() {
		let output;

		before( function() {
			output = i18nCalypsoCLI( {
				projectName: 'i18nTest',
				inputPaths: sourceFiles,
				format: 'POT',
				extras: [ 'date' ]
			} );

			// fs.writeFileSync( path.join( __dirname, 'pot.pot' ), output, 'utf8' );
		} );

		it( 'should have all the default headers', function() {
			expect( output ).to.have.string( '"Project-Id-Version: _s i18nTest\\n"\n' );
			expect( output ).to.have.string( '"Report-Msgid-Bugs-To:' );
			expect( output ).to.have.string( '"POT-Creation-Date:' );
			expect( output ).to.have.string( '"MIME-Version: 1.0\\n"\n' );
			expect( output ).to.have.string( '"Content-Type: text/plain; charset=UTF-8\\n"\n' );
			expect( output ).to.have.string( '"Content-Transfer-Encoding: 8bit\\n"\n' );
			expect( output ).to.have.string( '"PO-Revision-Date:' );
			expect( output ).to.have.string( '"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"\n' );
			expect( output ).to.have.string( '"Language-Team: LANGUAGE <LL@li.org>\\n"\n' );
		} );

		it( 'should create a simple translation', function() {
			expect( output ).to.have.string( 'msgid "My hat has three corners."\nmsgstr ""\n' );
		} );

		it( 'should create a plural translation', function() {
			expect( output ).to.have.string( 'msgid "My hat has four corners."\nmsgid_plural "My hats have five corners."\nmsgstr[0] ""\n' );
		} );

		it( 'should combine singular with plural translation', function() {
			expect( output ).not.to.have.string( 'msgid "My hat has four corners."\nmsgstr ""\n' );
		} );

		it( 'should create a context translation', function() {
			expect( output ).to.have.string( 'msgctxt "verb"\nmsgid "post"\nmsgstr ""\n' );
			expect( output ).to.have.string( 'msgctxt "verb2"\nmsgid "post2"\nmsgstr ""\n' );
		} );

		it( 'should prepend a translator comment', function() {
			expect( output ).to.have.string( '#. draft saved date format, see http://php.net/date' );
		} );

		it( 'should prepend the line number', function() {
			expect( output ).to.have.string( '#: test/cli/examples/i18n-test-examples.jsx:9\nmsgid "My hat has three corners too."' );
		} );

		it( 'should combine strings', function() {
			expect( output ).to.match( /#: test\/cli\/examples\/i18n-test-examples.jsx:\d+\n#: test\/cli\/examples\/i18n-test-examples.jsx:\d+\n#. Second ocurrence\nmsgid "My hat has three corners."/ );
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

		it( 'should find options with new plural syntax', function() {
			expect( output ).to.have.string( 'msgctxt "context after new plural syntax"\nmsgid "My hat has one corner."\nmsgid_plural "My hat has many corners."\nmsgstr[0] ""\n' );
		} );

		it( 'should handle template literals', function() {
			expect( output ).to.have.string( 'msgid "My hat has six corners."' );
			expect( output ).to.have.string( 'msgid "My hat\\nhas seventeen\\ncorners."' );
		} );

		it( 'should properly handle unicode escapes', function() {
			expect( output ).to.have.string( "This is how the test performed\\\\u2026" );
			expect( output ).to.have.string( "Here's how the post has performed so far\\\\u2026" );
		} );
	} );

	describe( 'PHP', function() {
		let output;

		before( function() {
			output = i18nCalypsoCLI( {
				projectName: 'i18nTest',
				inputPaths: sourceFiles,
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
			expect( output ).to.have.string( '_n( "My hat has four corners.", "My hats have five corners.", 1 ),' );
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

		it( 'should append the line number', function() {
			expect( output ).to.have.string( '__( "My hat has three corners." ), // test/cli/examples/i18n-test-examples.jsx:6' );
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

		it( 'should handle template literals', function() {
			expect( output ).to.have.string( 'My hat has six corners.' );
			expect( output ).to.have.string( '"My hat\nhas seventeen\ncorners."' );
		} );
	} );

	describe( 'PHP with an additional textdomain parameter', function() {
		let output;

		describe( 'that has no special symbols', function() {
			before( function() {
				output = i18nCalypsoCLI( {
					projectName: 'i18nTest',
					inputPaths: sourceFiles,
					phpArrayName: 'arrayName',
					format: 'PHP',
					extras: [ 'date' ],
					textdomain: 'some_domain'
				} );
			} );

			it( 'should create a simple __() translation', function() {
				expect( output ).to.have.string( '__( "My hat has three corners.", "some_domain" ),' );
			} );
		} );

		describe( 'that has double quotes', function() {
			before( function() {
				output = i18nCalypsoCLI( {
					projectName: 'i18nTest',
					inputPaths: sourceFiles,
					phpArrayName: 'arrayName',
					format: 'PHP',
					extras: [ 'date' ],
					textdomain: '"some"weird-!=domain"'
				} );
			} );

			it( 'should escape double quotes', function() {
				expect( output ).to.have.string( '"\\"some\\"weird-!=domain\\""' );
			} );
		} );

	} );
} );
