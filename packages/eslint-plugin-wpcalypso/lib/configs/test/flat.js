/**
 * @jest-environment node
 */
const { spawnSync } = require( 'child_process' );
const path = require( 'path' );

// A separate process: Jest can't require() ES-module plugins such as eslint-plugin-jsdoc.
const resolveRules = ( preset, file ) => {
	const result = spawnSync(
		process.execPath,
		[ path.join( __dirname, 'fixtures/resolve-rules.js' ), preset, file ],
		{ encoding: 'utf8' }
	);
	if ( result.status !== 0 ) {
		throw new Error( `resolve-rules exited with ${ result.status }:\n${ result.stderr }` );
	}
	return JSON.parse( result.stdout );
};

// Without this, the flat presets can drift from the legacy ones they're built from.
test.each( [
	[ 'react', 'src/component.jsx' ],
	[ 'recommended', 'src/index.js' ],
	// The legacy override's test-file exception.
	[ 'recommended', 'src/test/index.js' ],
] )(
	'flat/%s resolves the same rules and options as the legacy preset for %s',
	( preset, file ) => {
		const { legacy, flat } = resolveRules( preset, file );
		expect( flat ).toEqual( legacy );
	},
	30000
);
