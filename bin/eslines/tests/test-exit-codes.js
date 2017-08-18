const test = require( 'tape' );
const exitCode = require( '../src/lib/exit-code.js' );

// fixtures
const baseReport = require( './fixtures/eslint.json' );
const linesReport = require( './fixtures/eslint-lines-modified.json' );
const linesAndRulesReport = require( './fixtures/eslint-lines-and-rules.json' );
const parsingErrorsReport = require( './fixtures/eslint-parsing-errors.json' );
const noErrorsReport = require( './fixtures/eslint-with-no-errors.json' );

test( 'exit-code - returns 1 when there are errors', t => {
	t.equals( exitCode( baseReport ), 1 );
	t.equals( exitCode( linesReport ), 1 );
	t.equals( exitCode( linesAndRulesReport ), 1 );
	t.equals( exitCode( parsingErrorsReport ), 1 );
	t.end();
} );

test( 'exit-code - returns 0 when there are no errors', t => {
	t.equals( exitCode( noErrorsReport ), 0 );
	t.end();
} );
