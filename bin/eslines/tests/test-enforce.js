const test = require( 'tape' );
const enforce = require( '../src/lib/enforce.js' );

// fixtures
const baseReport = require( './fixtures/eslint.json' );
const enforceReport = require( './fixtures/eslint-enforce.json' );

test( 'enforce - empty array if original report is empty', t => {
	const newReport = enforce( [], [] );

	// newReport should be [] as well
	t.ok( Array.isArray( newReport ) );
	t.equals( newReport.length, 0 );
	t.end();
} );

test( 'enforce - same report if rules are empty', t => {
	const newReport = enforce( baseReport, [] );

	t.equals( JSON.stringify( newReport ), JSON.stringify( baseReport ) );
	t.end();
} );

test( 'enforce - same report if rules are not an array', t => {
	const newReport = enforce( baseReport );

	t.equals( JSON.stringify( newReport ), JSON.stringify( baseReport ) );
	t.end();
} );

test( 'enforce - rules to enforce are upgraded to errors', t => {
	const newReport = enforce( baseReport, [ 'semi', 'keyword-spacing' ] );

	t.equals( newReport[ 0 ].messages[ 0 ].severity, enforceReport[ 0 ].messages[ 0 ].severity );
	t.equals( newReport[ 0 ].messages[ 1 ].severity, enforceReport[ 0 ].messages[ 1 ].severity );
	t.equals( newReport[ 0 ].messages[ 2 ].severity, enforceReport[ 0 ].messages[ 2 ].severity );
	t.equals( newReport[ 0 ].messages[ 3 ].severity, enforceReport[ 0 ].messages[ 3 ].severity, '1st file 4th msg: upgrade semi' ); // eslint-disable-line max-len
	t.equals( newReport[ 0 ].warningCount, enforceReport[ 0 ].warningCount );
	t.equals( newReport[ 0 ].errorCount, enforceReport[ 0 ].errorCount );
	t.equals( newReport[ 1 ].messages[ 0 ].severity, enforceReport[ 1 ].messages[ 0 ].severity );
	t.equals( newReport[ 1 ].messages[ 1 ].severity, enforceReport[ 1 ].messages[ 1 ].severity );
	t.equals( newReport[ 1 ].messages[ 2 ].severity, enforceReport[ 1 ].messages[ 2 ].severity );
	t.equals( newReport[ 1 ].warningCount, enforceReport[ 1 ].warningCount );
	t.equals( newReport[ 1 ].errorCount, enforceReport[ 1 ].errorCount );
	t.equals( newReport[ 2 ].messages[ 0 ].severity, enforceReport[ 2 ].messages[ 0 ].severity );
	t.equals( newReport[ 2 ].messages[ 1 ].severity, enforceReport[ 2 ].messages[ 1 ].severity );
	t.equals( newReport[ 2 ].messages[ 2 ].severity, enforceReport[ 2 ].messages[ 2 ].severity );
	t.equals( newReport[ 2 ].warningCount, enforceReport[ 2 ].warningCount );
	t.equals( newReport[ 2 ].errorCount, enforceReport[ 2 ].errorCount );
	t.equals( newReport[ 3 ].messages.length, enforceReport[ 3 ].messages.length );
	t.equals( newReport[ 3 ].warningCount, enforceReport[ 3 ].warningCount );
	t.equals( newReport[ 3 ].errorCount, enforceReport[ 3 ].errorCount );
	t.equals( newReport[ 4 ].messages[ 0 ].severity, enforceReport[ 4 ].messages[ 0 ].severity );
	t.equals( newReport[ 4 ].messages[ 1 ].severity, enforceReport[ 4 ].messages[ 1 ].severity );
	t.equals( newReport[ 4 ].messages[ 2 ].severity, enforceReport[ 4 ].messages[ 2 ].severity );
	t.equals( newReport[ 4 ].messages[ 3 ].severity, enforceReport[ 4 ].messages[ 3 ].severity );
	t.equals( newReport[ 4 ].messages[ 4 ].severity, enforceReport[ 4 ].messages[ 4 ].severity );
	t.equals( newReport[ 4 ].messages[ 5 ].severity, enforceReport[ 4 ].messages[ 5 ].severity );
	t.equals( newReport[ 4 ].messages[ 6 ].severity, enforceReport[ 4 ].messages[ 6 ].severity );
	t.equals( newReport[ 4 ].messages[ 7 ].severity, enforceReport[ 4 ].messages[ 7 ].severity );
	t.equals( newReport[ 4 ].messages[ 8 ].severity, enforceReport[ 4 ].messages[ 8 ].severity );
	t.equals( newReport[ 4 ].messages[ 9 ].severity, enforceReport[ 4 ].messages[ 9 ].severity );
	t.equals( newReport[ 4 ].messages[ 10 ].severity, enforceReport[ 4 ].messages[ 10 ].severity );
	t.equals( newReport[ 4 ].messages[ 11 ].severity, enforceReport[ 4 ].messages[ 11 ].severity );
	t.equals( newReport[ 4 ].messages[ 12 ].severity, enforceReport[ 4 ].messages[ 12 ].severity );
	t.equals( newReport[ 4 ].messages[ 13 ].severity, enforceReport[ 4 ].messages[ 13 ].severity );
	t.equals( newReport[ 4 ].warningCount, enforceReport[ 4 ].warningCount );
	t.equals( newReport[ 4 ].errorCount, enforceReport[ 4 ].errorCount );
	t.equals( newReport[ 5 ].messages[ 0 ].severity, enforceReport[ 5 ].messages[ 0 ].severity );
	t.equals( newReport[ 5 ].messages[ 1 ].severity, enforceReport[ 5 ].messages[ 1 ].severity );
	t.equals( newReport[ 5 ].warningCount, enforceReport[ 5 ].warningCount );
	t.equals( newReport[ 5 ].errorCount, enforceReport[ 5 ].errorCount );
	t.equals( newReport[ 6 ].messages[ 0 ].severity, enforceReport[ 6 ].messages[ 0 ].severity );
	t.equals( newReport[ 6 ].messages[ 1 ].severity, enforceReport[ 6 ].messages[ 1 ].severity );
	t.equals( newReport[ 6 ].messages[ 2 ].severity, enforceReport[ 6 ].messages[ 2 ].severity );
	t.equals( newReport[ 6 ].messages[ 3 ].severity, enforceReport[ 6 ].messages[ 3 ].severity );
	t.equals( newReport[ 6 ].warningCount, enforceReport[ 6 ].warningCount );
	t.equals( newReport[ 6 ].errorCount, enforceReport[ 6 ].errorCount );
	t.equals( newReport[ 7 ].messages[ 0 ].severity, enforceReport[ 7 ].messages[ 0 ].severity );
	t.equals( newReport[ 7 ].messages[ 1 ].severity, enforceReport[ 7 ].messages[ 1 ].severity );
	t.equals( newReport[ 7 ].messages[ 2 ].severity, enforceReport[ 7 ].messages[ 2 ].severity, '8th file 3rd msg: upgrade keyword-spacing to error' ); // eslint-disable-line max-len
	t.equals( newReport[ 7 ].warningCount, enforceReport[ 7 ].warningCount );
	t.equals( newReport[ 7 ].errorCount, enforceReport[ 7 ].errorCount );
	t.equals( newReport[ 8 ].messages[ 0 ].severity, enforceReport[ 8 ].messages[ 0 ].severity );
	t.equals( newReport[ 8 ].messages[ 1 ].severity, enforceReport[ 8 ].messages[ 1 ].severity );
	t.equals( newReport[ 8 ].messages[ 2 ].severity, enforceReport[ 8 ].messages[ 2 ].severity );
	t.equals( newReport[ 8 ].messages[ 3 ].severity, enforceReport[ 8 ].messages[ 3 ].severity );
	t.equals( newReport[ 8 ].messages[ 4 ].severity, enforceReport[ 8 ].messages[ 4 ].severity );
	t.equals( newReport[ 8 ].messages[ 5 ].severity, enforceReport[ 8 ].messages[ 5 ].severity );
	t.equals( newReport[ 8 ].messages[ 6 ].severity, enforceReport[ 8 ].messages[ 6 ].severity );
	t.equals( newReport[ 8 ].messages[ 7 ].severity, enforceReport[ 8 ].messages[ 7 ].severity );
	t.equals( newReport[ 8 ].messages[ 8 ].severity, enforceReport[ 8 ].messages[ 8 ].severity );
	t.equals( newReport[ 8 ].warningCount, enforceReport[ 8 ].warningCount );
	t.equals( newReport[ 8 ].errorCount, enforceReport[ 8 ].errorCount );
	t.end();
} );
