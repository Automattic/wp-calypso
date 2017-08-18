const test = require( 'tape' );
const filterParsingErrors = require( '../src/lib/filter-parsing-errors.js' );

// fixtures
const reportWithParsingError = require( './fixtures/eslint-parsing-errors.json' );
const reportWithoutParsingErrors = require( './fixtures/eslint.json' );

test( 'filter-parsing-errors - returns empty report for reports without parsing errors', t => {
	const newReport = filterParsingErrors( reportWithoutParsingErrors );
	t.equals( newReport.length, 0 );

	t.end();
} );

test( 'filter-parsing-errors - returns report containing only files with parsing errors', t => {
	const newReport = filterParsingErrors( reportWithParsingError );
	t.equals( newReport.length, 1 );

	t.end();
} );
