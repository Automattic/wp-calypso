/** @format */
/**
 * External dependencies
 */
const path = require( 'path' );

/**
 * Internal dependencies
 */
const i18nCalypsoCLI = require( '../i18n' );

// generate whitelist file
const sourceFiles = [
	'examples/i18n-test-examples.jsx',
	'examples/i18n-test-example-second-file.jsx',
].map( file => path.join( __dirname, file ) );

/**
 * In these tests we are taking the translate requests from
 * examples/ and generating the corresponding php code and pot file
 * and saving it into output.php. We then check to make sure
 * the output file contains what we expect.
 */
describe( 'POT', () => {
	let output;

	beforeAll( () => {
		output = i18nCalypsoCLI( {
			projectName: 'i18nTest',
			inputPaths: sourceFiles,
			format: 'POT',
			extras: [ 'date' ],
		} );

		// fs.writeFileSync( path.join( __dirname, 'pot.pot' ), output, 'utf8' );
	} );

	test( 'should have all the default headers', () => {
		expect( output ).toEqual( expect.stringContaining( '"Project-Id-Version: _s i18nTest\\n"\n' ) );
		expect( output ).toEqual( expect.stringContaining( '"Report-Msgid-Bugs-To:' ) );
		expect( output ).toEqual( expect.stringContaining( '"POT-Creation-Date:' ) );
		expect( output ).toEqual( expect.stringContaining( '"MIME-Version: 1.0\\n"\n' ) );
		expect( output ).toEqual(
			expect.stringContaining( '"Content-Type: text/plain; charset=UTF-8\\n"\n' )
		);
		expect( output ).toEqual( expect.stringContaining( '"Content-Transfer-Encoding: 8bit\\n"\n' ) );
		expect( output ).toEqual( expect.stringContaining( '"PO-Revision-Date:' ) );
		expect( output ).toEqual(
			expect.stringContaining( '"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"\n' )
		);
		expect( output ).toEqual(
			expect.stringContaining( '"Language-Team: LANGUAGE <LL@li.org>\\n"\n' )
		);
	} );

	test( 'should create a simple translation', () => {
		expect( output ).toEqual(
			expect.stringContaining( 'msgid "My hat has three corners."\nmsgstr ""\n' )
		);
	} );

	test( 'should create a plural translation', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'msgid "My hat has four corners."\nmsgid_plural "My hats have five corners."\nmsgstr[0] ""\n'
			)
		);
	} );

	test( 'should combine singular with plural translation', () => {
		expect( output ).not.toEqual(
			expect.stringContaining( 'msgid "My hat has four corners."\nmsgstr ""\n' )
		);
	} );

	test( 'should create a context translation', () => {
		expect( output ).toEqual(
			expect.stringContaining( 'msgctxt "verb"\nmsgid "post"\nmsgstr ""\n' )
		);
		expect( output ).toEqual(
			expect.stringContaining( 'msgctxt "verb2"\nmsgid "post2"\nmsgstr ""\n' )
		);
	} );

	test( 'should prepend a translator comment', () => {
		expect( output ).toEqual(
			expect.stringContaining( '#. draft saved date format, see http://php.net/date' )
		);
	} );

	test( 'should prepend the line number', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'#: test/examples/i18n-test-examples.jsx:9\nmsgid "My hat has three corners too."'
			)
		);
	} );

	test( 'should combine strings', () => {
		expect( output ).toEqual(
			expect.stringMatching(
				/#: test\/examples\/i18n-test-examples.jsx:\d+\n#: test\/examples\/i18n-test-examples.jsx:\d+\n#. Second ocurrence\nmsgid "My hat has three corners."/
			)
		);
	} );

	test( 'should pass through an sprintf as a regular translation', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'msgid "Your city is %(city)s and your zip is %(zip)s."\nmsgstr ""\n'
			)
		);
	} );

	test( 'should allow string concatenating with + operator', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				[
					'msgid ""',
					'"This is a multi-line translation with \\"mixed quotes\\" and mixed \'single "',
					'"quotes\'"',
					'msgstr ""',
				].join( '\n' )
			)
		);
	} );

	// we are updating the translate api for plurals to allow for:
	// i18n.translate( 'single', 'plural', options );
	// we will honor the prior syntax but raise a warning in the console
	test( 'should handle the new plural syntax', () => {
		expect( output ).toEqual(
			expect.stringContaining( 'msgid "single test"\nmsgid_plural "plural test"\nmsgstr[0] ""\n' )
		);
	} );

	test( 'should include default translations for number formatting strings', () => {
		expect( output ).toEqual( expect.stringContaining( 'msgid "number_format_thousands_sep"\n' ) );
		expect( output ).toEqual( expect.stringContaining( 'msgid "number_format_decimal_point"\n' ) );
	} );

	test( 'should find translations from multiple files', () => {
		expect( output ).toEqual(
			expect.stringContaining( 'msgid "My test has two files."\nmsgstr ""\n' )
		);
	} );

	test( 'should find options with a literal string key', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'msgctxt "context with a literal string key"\nmsgid "The string key text"\nmsgstr ""\n'
			)
		);
	} );

	test( 'should find options with new plural syntax', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'msgctxt "context after new plural syntax"\nmsgid "My hat has one corner."\nmsgid_plural "My hat has many corners."\nmsgstr[0] ""\n'
			)
		);
	} );

	test( 'should handle template literals', () => {
		expect( output ).toEqual( expect.stringContaining( 'msgid "My hat has six corners."' ) );
		expect( output ).toEqual(
			expect.stringContaining( 'msgid "My hat\\nhas seventeen\\ncorners."' )
		);
	} );

	test( 'should properly handle unicode escapes', () => {
		expect( output ).toEqual(
			expect.stringContaining( 'This is how the test performed\\\\u2026' )
		);
		expect( output ).toEqual(
			expect.stringContaining( "Here's how the post has performed so far\\\\u2026" )
		);
	} );
} );

describe( 'PHP', () => {
	let output;

	beforeAll( () => {
		output = i18nCalypsoCLI( {
			projectName: 'i18nTest',
			inputPaths: sourceFiles,
			phpArrayName: 'arrayName',
			format: 'PHP',
			extras: [ 'date' ],
		} );
	} );

	test( 'should open with a php opening tag', () => {
		expect( output ).toMatch( /^<\?php/ );
	} );

	test( 'should create an array with the passed-in name', () => {
		expect( output ).toEqual( expect.stringContaining( '$arrayName = array(\n' ) );
	} );

	test( 'should create a simple __() translation', () => {
		expect( output ).toEqual( expect.stringContaining( '__( "My hat has three corners." ),' ) );
	} );

	test( 'should create a plural _n() translation', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'_n( "My hat has four corners.", "My hats have five corners.", 1 ),'
			)
		);
	} );

	test( 'should create a context _x() translation', () => {
		expect( output ).toEqual( expect.stringContaining( '_x( "post", "verb" ),' ) );
	} );

	test( 'should allow `original` as initial string', () => {
		expect( output ).toEqual( expect.stringContaining( '_x( "post2", "verb2" ),' ) );
	} );

	test( 'should prepend a translator comment', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'/* translators: draft saved date format, see http://php.net/date */\n__( "g:i:s a" ),'
			)
		);
	} );

	test( 'should append the line number', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'__( "My hat has three corners." ), // test/examples/i18n-test-examples.jsx:6'
			)
		);
	} );

	test( 'should pass through an sprintf as a regular __() method', () => {
		expect( output ).toEqual(
			expect.stringContaining( '__( "Your city is %(city)s and your zip is %(zip)s." ),' )
		);
	} );

	test( 'should allow string concatenating with + operator', () => {
		expect( output ).toEqual(
			expect.stringContaining(
				'__( "This is a multi-line translation with \\"mixed quotes\\" and mixed \'single quotes\'" ),'
			)
		);
	} );

	// we are updating the translate api for plurals to allow for:
	// i18n.translate( 'single', 'plural', options );
	// we will honor the prior syntax but raise a warning in the console
	test( 'should handle the new plural syntax', () => {
		expect( output ).toEqual( expect.stringContaining( '_n( "single test", "plural test", 1 ),' ) );
	} );

	test( 'should allow a variable placeholder for `count`', () => {
		expect( output ).toEqual(
			expect.stringContaining( '_n( "single test2", "plural test2", 1 ),' )
		);
	} );

	test( 'should include default translations for momentjs object', () => {
		expect( output ).toEqual( expect.stringContaining( '__( "number_format_thousands_sep" ),' ) );
		expect( output ).toEqual( expect.stringContaining( '__( "number_format_decimal_point" ),' ) );
	} );

	test( 'should close the php array', () => {
		expect( output ).toEqual( expect.stringContaining( '\n);' ) );
	} );

	test( 'should find translations from multiple files', () => {
		expect( output ).toEqual( expect.stringContaining( '__( "My test has two files." ),' ) );
	} );

	test( 'should find options with a literal string key', () => {
		expect( output ).toEqual( expect.stringContaining( 'context with a literal string key' ) );
	} );

	test( 'should handle template literals', () => {
		expect( output ).toEqual( expect.stringContaining( 'My hat has six corners.' ) );
		expect( output ).toEqual( expect.stringContaining( '"My hat\nhas seventeen\ncorners."' ) );
	} );
} );

describe( 'PHP with an additional textdomain parameter', () => {
	let output;

	describe( 'that has no special symbols', () => {
		beforeAll( () => {
			output = i18nCalypsoCLI( {
				projectName: 'i18nTest',
				inputPaths: sourceFiles,
				phpArrayName: 'arrayName',
				format: 'PHP',
				extras: [ 'date' ],
				textdomain: 'some_domain',
			} );
		} );

		test( 'should create a simple __() translation', () => {
			expect( output ).toEqual(
				expect.stringContaining( '__( "My hat has three corners.", "some_domain" ),' )
			);
		} );
	} );

	describe( 'that has double quotes', () => {
		beforeAll( () => {
			output = i18nCalypsoCLI( {
				projectName: 'i18nTest',
				inputPaths: sourceFiles,
				phpArrayName: 'arrayName',
				format: 'PHP',
				extras: [ 'date' ],
				textdomain: '"some"weird-!=domain"',
			} );
		} );

		test( 'should escape double quotes', () => {
			expect( output ).toEqual( expect.stringContaining( '"\\"some\\"weird-!=domain\\""' ) );
		} );
	} );
} );
