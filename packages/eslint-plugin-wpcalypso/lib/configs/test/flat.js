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

// Without this, a new `extends` entry, override or setting in a legacy preset slips past the test
// above: its fixture flattens the legacy presets by hand, the way `../flat.js` builds them.
test( 'the legacy presets have the shape the flat ones and the fixture assume', () => {
	const recommended = require( '../recommended' );
	const react = require( '../react' );

	expect( Object.keys( recommended ).sort() ).toEqual( [
		'env',
		'extends',
		'overrides',
		'parser',
		'parserOptions',
		'plugins',
		'rules',
		'settings',
	] );
	expect( recommended.env ).toEqual( { es6: true } );
	expect( recommended.extends ).toEqual( [ 'eslint:recommended', 'plugin:jsdoc/recommended' ] );
	expect( recommended.overrides ).toEqual( [
		{ files: [ '**/test/*', '*.json', '*.md' ], rules: expect.any( Object ) },
	] );
	expect( Object.keys( react ).sort() ).toEqual( [
		'extends',
		'parserOptions',
		'plugins',
		'rules',
	] );
	expect( react.extends ).toBe( 'plugin:wpcalypso/recommended' );
} );
