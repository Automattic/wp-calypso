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

// Legacy configs resolve `eslint:recommended` to ESLint 8's list; flat ones use `@eslint/js`.
const eslintRecommendedChanges = {
	'no-constant-binary-expression': [ undefined, [ 2 ] ],
	'no-empty-static-block': [ undefined, [ 2 ] ],
	'no-inner-declarations': [ [ 2 ], undefined ],
	'no-new-native-nonconstructor': [ undefined, [ 2 ] ],
	'no-new-symbol': [ [ 2 ], undefined ],
	'no-unused-private-class-members': [ undefined, [ 2 ] ],
};

// Without this, the flat presets published for ESLint 10 can drift from the legacy ones.
test.each( [
	[ 'react', 'src/component.jsx' ],
	[ 'recommended', 'src/index.js' ],
	// The legacy override's test-file exception.
	[ 'recommended', 'src/test/index.js' ],
] )(
	'flat/%s resolves the same rules as the legacy preset for %s',
	( preset, file ) => {
		const { legacy, flat } = resolveRules( preset, file );
		const differences = Object.fromEntries(
			[ ...new Set( [ ...Object.keys( legacy ), ...Object.keys( flat ) ] ) ]
				.filter( ( rule ) => JSON.stringify( legacy[ rule ] ) !== JSON.stringify( flat[ rule ] ) )
				.map( ( rule ) => [ rule, [ legacy[ rule ], flat[ rule ] ] ] )
		);
		expect( differences ).toEqual( eslintRecommendedChanges );
	},
	30000
);
