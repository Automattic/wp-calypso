const fs = require( 'fs' );
const test = require( 'tape' );
const eslinesDiff = require( '../src/lib/differ' );

// fixtures
const gitDiffStr = './tests/fixtures/git.diff';

test( 'differ - reads all files from diff', t => {
	fs.readFile( gitDiffStr, 'utf-8', ( err, data ) => {
		const files = eslinesDiff( data );

		t.equals( Object.keys( files ).length, 5 );
		t.end();
	} );
} );

test( 'differ - get file names from diff ', t => {
	fs.readFile( gitDiffStr, 'utf-8', ( err, data ) => {
		const files = eslinesDiff( data );
		const keys = Object.keys( files );

		t.equals( keys[ 0 ], '/home/vagrant/wp-calypso/.eslintrc.js' );
		t.equals( keys[ 1 ], '/home/vagrant/wp-calypso/bin/run-lint' );
		t.equals( keys[ 2 ], '/home/vagrant/wp-calypso/circle.yml' );
		t.equals( keys[ 3 ], '/home/vagrant/wp-calypso/client/components/accordion/section.jsx' );
		t.equals( keys[ 4 ], '/home/vagrant/wp-calypso/package.json' );
		t.end();
	} );
} );

test( 'differ - get lines for each file', t =>{
	fs.readFile( gitDiffStr, 'utf-8', ( err, data ) => {
		const files = eslinesDiff( data );
		const keys = Object.keys( files );

		t.equals( files[ keys[ 0 ] ][ 0 ], 68, '1st file, 1st chunk: 68' );
		t.equals( files[ keys[ 0 ] ].length, 1, '1st file length' );
		t.equals( files[ keys[ 1 ] ][ 0 ], 6, '2nd file, 1st chunk: 6' );
		t.equals( files[ keys[ 1 ] ][ 1 ], 5, '2nd file, 1st chunk: 5' );
		t.equals( files[ keys[ 1 ] ][ 2 ], 4, '2nd file, 1st chunk: 4' );
		t.equals( files[ keys[ 1 ] ][ 3 ], 10, '2nd file, 2nd chunk: 10' );
		t.equals( files[ keys[ 1 ] ][ 4 ], 9, '2nd file, 2nd chunk: 9' );
		t.equals( files[ keys[ 1 ] ].length, 5, '2nd file length' );
		t.equals( files[ keys[ 2 ] ][ 0 ], 9, '3rd file, 1st chunk: 9' );
		t.equals( files[ keys[ 2 ] ].length, 1, '3rd file length' );
		t.equals( files[ keys[ 3 ] ][ 0 ], 8, '4th file, 1st chunk: 8' );
		t.equals( files[ keys[ 3 ] ].length, 1, '4th file length' );
		t.equals( files[ keys[ 4 ] ][ 0 ], 145, '5th file, 1st chunk: 145' );
		t.equals( files[ keys[ 4 ] ].length, 1, '5th file length' );
		t.end();
	} );
} );

test( 'differ - returns {} if not diff provided ', t =>{
	const files = eslinesDiff();
	t.equals( Object.keys( files ).length, 0 );
	t.equals( files.constructor, Object );
	t.end();
} );
