// eslint-disable-next-line import/no-nodejs-modules
const fs = require( 'fs' );
const disableLodashAmdLoader = require( '../disable-lodash-amd-loader' );

describe( 'disableLodashAmdLoader', () => {
	it( 'disables lodash AMD detection', () => {
		const source =
			"if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) { root._ = _; }";

		expect( disableLodashAmdLoader( source ) ).toBe( 'if (false) { root._ = _; }' );
	} );

	it( 'disables AMD detection in the installed lodash source', () => {
		const lodashSource = fs.readFileSync( require.resolve( 'lodash/lodash.js' ), 'utf8' );
		const result = disableLodashAmdLoader( lodashSource );

		expect( result ).not.toContain(
			"typeof define == 'function' && typeof define.amd == 'object' && define.amd"
		);
		expect( result ).toContain( 'if (false)' );
	} );

	it( 'fails loudly when the lodash AMD branch is not found', () => {
		const source = 'module.exports = lodash;';

		expect( () => disableLodashAmdLoader( source ) ).toThrow(
			'Expected to disable lodash AMD detection'
		);
	} );
} );
