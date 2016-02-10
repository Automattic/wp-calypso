var assert = require( 'chai' ).assert,
	i18nlint = require( '../i18nlint.js' ),
	auditString = i18nlint.auditStringForUnqualifiedPlaceholders;

/*
 * Convenience variables
 */
var unqualifiedPlaceholdersSnippet = 'multiple placeholders in a translation should be named.',
	missingSingularPlaceholderSnippet = 'Placeholders in the plural and singular strings should match',
	variableTranslateArgumentsSnippet = 'literal';

describe( 'i18nlint.auditString', function() {
	it( 'should not find problems with an ok string \'%(s)s%(t)s\'', function() {
		assert.isFalse( auditString( '%(s)s%(t)s' ) );
	} );

	it( 'should not find multiple unqualified placeholders in \'%%s%s%%s\'', function() {
		assert.isFalse( auditString( '%%s%s%%s' ) );
	} );

	it( 'should not find multiple unqualified placeholders in \'%1s%2s%3s\'', function() {
		assert.isFalse( auditString( '1s%2s%3s' ) );
	} );

	it( 'should find multiple unqualified placeholders in \'%s%s\'', function() {
		assert.include( auditString( '%s%s' ), unqualifiedPlaceholdersSnippet );
	} );

	it( 'should find multiple unqualified placeholders in \'One: %s, Two: %s\'', function() {
		assert.include( auditString( 'One: %s, Two: %s' ), unqualifiedPlaceholdersSnippet );
	} );

	it( 'should find multiple unqualified placeholders in \'%s%d\'', function() {
		assert.include( auditString( '%s%d' ), unqualifiedPlaceholdersSnippet );
	} );
} );

describe( 'i18nlint', function() {
	it( 'should find problems in testfiles/duplicate-placeholders.js', function() {
		var warnings = i18nlint.scanFile( 'test/testfiles/duplicate-placeholders.js' );
		assert.typeOf( warnings, 'array' );
		assert.equal( warnings.length, 1 );
	} );

	it( 'should be ok with testfiles/fine', function() {
		var warnings = i18nlint.scanFile( 'test/testfiles/fine.js' );
		assert.typeOf( warnings, 'array' );
		assert.equal( warnings.length, 0 );
	} );

	it( 'should find mismatched singular/plural placeholders in testfiles/missing-singular-placeholder.js', function() {
		var warnings = i18nlint.scanFile( 'test/testfiles/missing-singular-placeholder.js' );
		assert.typeOf( warnings, 'array' );
		assert.equal( warnings.length, 1, 'Should have 1 warning' );
		assert.include( warnings[ 0 ].string, missingSingularPlaceholderSnippet );
	} );

	it( 'should handle node scripts (hashbangs)', function() {
		var warnings = i18nlint.scanFile( 'test/testfiles/hashbang.js' );
		assert.typeOf( warnings, 'array' );
		assert.equal( warnings.length, 1, 'warnings.length' );
		assert.equal( warnings[ 0 ].location.line, '15', 'Hashbangs should not invalidate line numbers' );
	} );

	it( 'should handle jsx', function() {
		var warnings = i18nlint.scanFile( 'test/testfiles/testfile.jsx' );
		assert.typeOf( warnings, 'array' );
		assert.equal( warnings.length, 1, 'warnings.length should be 1' );
		assert.equal( warnings[ 0 ].location.line, '35', 'Indicate the correct position in the file' );
		assert.equal( warnings[ 0 ].location.column, '25', 'Indicate the column position in the file (as long as tabs aren\'t involved' );
	} );

	it( 'should find unqualified placeholders through concatenation and quotes', function() {
		var warnings = i18nlint.scanFile( 'test/testfiles/concatenation-and-quotes.js' );
		assert.typeOf( warnings, 'array' );
		assert.equal( warnings.length, 1 );
		assert.include( warnings[ 0 ].string, unqualifiedPlaceholdersSnippet );
	} );

	it( 'should warn about non-literal arguments to translate()', function() {
		var i, specificProblems,
			warnings = i18nlint.scanFile( 'test/testfiles/non-literal-translate-arguments.js' ),
			// snippets to differentiate error messages
			args = 'to translate()',
			context = 'context',
			comment = 'comment';

		// A list of the actual problems in the test file
		specificProblems = [ args, args, context, comment, context, comment ];

		assert.equal( warnings.length, specificProblems.length );

		for ( i = 0; i < warnings.length; i++ ) {
			// Make sure they all explain about literals
			assert.include( warnings[ i ].string, variableTranslateArgumentsSnippet );
			// Check that we specify what caused the problem
			assert.include( warnings[ i ].string, specificProblems[ i ] );
		}
	} );

	it( 'should warn about using three dots', function() {
		var warnings = i18nlint.scanSource( 'translate( \'one\', \'more...\', { count:3 })' );
		assert.equal( warnings.length, 1 );
		assert.include( warnings[ 0 ].string.toLowerCase(), 'ellipsis' );
	} );

	it( 'should warn about strings that are just placeholders', function() {
		var placeholderOnlySingular = "translate( '{{calypsoComponent}}%(printfPlaceholder)s{{/calypsoComponent}}' );",
			placeholderOnlyPlural = "translate( 'Some text & %s',\n '%s', \n{ count:3, args: someText } );",
			warnings = i18nlint.scanSource( placeholderOnlySingular + placeholderOnlyPlural );

		assert.lengthOf( warnings, 2 );
		warnings.forEach( function( v ) {
			assert.include( v.string, 'entirely placeholders' );
		} );
	} );

	it( 'should warn about the right argument', function() {
		var warnings,
			duplicatePlaceholderInSingular = "translate( '%s',\n'Text %s',\n{ count: n } );",
			duplicatePlaceholderInPlural = "translate( 'Text %s',\n '%s', \n{ count: n } );",
			duplicatePluralInOptions = "translate( { single: 'Text %s', plural: '%s', count: n } );";

		warnings = i18nlint.scanSource( duplicatePlaceholderInSingular );
		assert.lengthOf( warnings, 1, '' );
		assert.equal( warnings[ 0 ].location.line, 1, 'warning in singular on line 1' );

		warnings = i18nlint.scanSource( duplicatePlaceholderInPlural );
		assert.lengthOf( warnings, 1 );
		assert.equal( warnings[ 0 ].location.line, 2, 'warning in plural on line 2' );

		warnings = i18nlint.scanSource( duplicatePluralInOptions );
		assert.lengthOf( warnings, 1 );
		assert.equal( warnings[ 0 ].location.line, 1, 'warning in options on line 1' );
	} );
} );
