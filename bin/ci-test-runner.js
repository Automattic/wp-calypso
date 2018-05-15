/** @format */
/**
 * Replaces runner from package.json
 *  "   cross-env-shell TEST_REPORT_FILENAME=./test-results-client.xml jest -c=test/client/jest.config.ci.js -w=2 "fileA" "fileB"
 *
 * CircleCI was sending us the wrong files due to a bug in the file
 * glob patterns. For example, "abtest" was matching in the pattern
 *
 *  - **\//test/*.js (leading slash escaped because of JS comment)
 *
 * This runner applies the constraint on the given files to prune
 * out the invalid results.
 *
 * Usage:
 *    node bin/ci-test-runner.js client file/path/a.js file/path/b.jsx
 *    node bin/ci-test-runner.js server file/path/c.js file/path/d.js file/path/e.js
 *
 */

const execSync = require( 'child_process' ).execSync;
const path = require( 'path' );

// client or server
const build = process.argv[ 2 ];

execSync(
	[
		path.join( __dirname, '..', 'node_modules', '.bin', 'jest' ),
		'-w=2',
		'-c="test/' + build + '/jest.config.ci.js"',
		'--colors',
		...process.argv
			.slice( 3 )
			.filter( path => /\/test\//.test( path ) )
			.map( path => '"' + path + '"' ),
	].join( ' ' ),
	{
		env: { ...process.env, TEST_REPORT_FILENAME: './test-results-' + build + '.xml' },
	}
);
