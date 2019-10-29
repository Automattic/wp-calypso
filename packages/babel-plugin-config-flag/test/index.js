/**
 * External dependencies
 */
const babel = require( '@babel/core' );

// Transform a string using babel, with the plugin.
function transform( code ) {
	return babel.transformSync( code, {
		configFile: false,
		plugins: [ [ require( '..' ), { flags: { foo: true } } ] ],
	} ).code;
}

// Helper method to remove whitespace from examples.
function noIndent( strings ) {
	if ( typeof strings === 'string' ) {
		strings = [ strings ];
	}

	return strings
		.join( '' ) // Join strings
		.split( '\n' ) // Split at newlines
		.map( line => line.replace( /^\s+/gm, '' ) ) // Remove whitespace from each line
		.join( '\n' ) // Join back with newlines
		.trim(); // Trim surrounding whitespace
}

describe( 'babel-plugin-transform-wpcalypso-async', () => {
	describe( 'for default imports', () => {
		test( 'should replace usage of the provided flags at the module level', () => {
			const code = transform( `
				import config from 'config';
				const foo = config.isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import config from 'config';
				const foo = true;` );
		} );

		test( 'should replace usage of the provided flags at the function level', () => {
			const code = transform( `
				import config from 'config';

				function fn() {
					const foo = config.isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import config from 'config';

				function fn() {
					const foo = true;
				}` );
		} );

		test( 'should not replace usage of flags that are not provided', () => {
			const code = transform( `
				import config from 'config';
				const bar = config.isEnabled('bar');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import config from 'config';
				const bar = config.isEnabled('bar');` );
		} );

		test( 'should replace usage of the provided flags with a different import name', () => {
			const code = transform( `
				import configRenamed from 'config';
				const foo = configRenamed.isEnabled('foo');
				const foo2 = config.isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import configRenamed from 'config';
				const foo = true;
				const foo2 = config.isEnabled('foo');` );
		} );

		test( 'should not replace usage of the provided flags with different config module', () => {
			const code = transform( `
				import config from './config';
				const foo = config.isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import config from './config';
				const foo = config.isEnabled('foo');` );
		} );

		test( 'should not replace usage of the provided flags when import is shadowed by parameters', () => {
			const code = transform( `
				import config from 'config';

				function fn(config) {
					const foo = config.isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import config from 'config';

				function fn(config) {
					const foo = config.isEnabled('foo');
				}` );
		} );

		test( 'should not replace usage of the provided flags when import is shadowed by variables', () => {
			const code = transform( `
				import config from 'config';

				function fn() {
					const config = somethingElse;
					const foo = config.isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import config from 'config';

				function fn() {
					const config = somethingElse;
					const foo = config.isEnabled('foo');
				}` );
		} );
	} );

	describe( 'for namespaced imports', () => {
		test( 'should replace usage of the provided flags at the module level', () => {
			const code = transform( `
				import * as config from 'config';
				const foo = config.isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import * as config from 'config';
				const foo = true;` );
		} );

		test( 'should replace usage of the provided flags at the function level', () => {
			const code = transform( `
				import * as config from 'config';

				function fn() {
					const foo = config.isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import * as config from 'config';

				function fn() {
					const foo = true;
				}` );
		} );

		test( 'should not replace usage of flags that are not provided', () => {
			const code = transform( `
				import * as config from 'config';
				const bar = config.isEnabled('bar');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import * as config from 'config';
				const bar = config.isEnabled('bar');` );
		} );

		test( 'should replace usage of the provided flags with a different import name', () => {
			const code = transform( `
				import * as configRenamed from 'config';
				const foo = configRenamed.isEnabled('foo');
				const foo2 = config.isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import * as configRenamed from 'config';
				const foo = true;
				const foo2 = config.isEnabled('foo');` );
		} );

		test( 'should not replace usage of the provided flags with different config module', () => {
			const code = transform( `
				import * as config from './config';
				const foo = config.isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import * as config from './config';
				const foo = config.isEnabled('foo');` );
		} );

		test( 'should not replace usage of the provided flags when import is shadowed by parameters', () => {
			const code = transform( `
				import * as config from 'config';

				function fn(config) {
					const foo = config.isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import * as config from 'config';

				function fn(config) {
					const foo = config.isEnabled('foo');
				}` );
		} );

		test( 'should not replace usage of the provided flags when import is shadowed by variables', () => {
			const code = transform( `
				import * as config from 'config';

				function fn() {
					const config = somethingElse;
					const foo = config.isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import * as config from 'config';

				function fn() {
					const config = somethingElse;
					const foo = config.isEnabled('foo');
				}` );
		} );
	} );

	describe( 'for named imports', () => {
		test( 'should replace usage of the provided flags at the module level', () => {
			const code = transform( `
				import { isEnabled } from 'config';
				const foo = isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import { isEnabled } from 'config';
				const foo = true;` );
		} );

		test( 'should replace usage of the provided flags at the function level', () => {
			const code = transform( `
				import { isEnabled } from 'config';

				function fn() {
					const foo = isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import { isEnabled } from 'config';

				function fn() {
					const foo = true;
				}` );
		} );

		test( 'should not replace usage of flags that are not provided', () => {
			const code = transform( `
				import { isEnabled } from 'config';
				const bar = isEnabled('bar');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import { isEnabled } from 'config';
				const bar = isEnabled('bar');` );
		} );

		test( 'should replace usage of the provided flags with a different import name', () => {
			const code = transform( `
				import { isEnabled as isEnabledRenamed } from 'config';
				const foo = isEnabledRenamed('foo');
				const foo2 = isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import { isEnabled as isEnabledRenamed } from 'config';
				const foo = true;
				const foo2 = isEnabled('foo');` );
		} );

		test( 'should not replace usage of the provided flags with different config module', () => {
			const code = transform( `
				import { isEnabled } from './config';
				const foo = isEnabled('foo');` );

			expect( noIndent( code ) ).toBe( noIndent`
				import { isEnabled } from './config';
				const foo = isEnabled('foo');` );
		} );

		test( 'should not replace usage of the provided flags when import is shadowed by parameters', () => {
			const code = transform( `
				import { isEnabled } from 'config';

				function fn(isEnabled) {
					const foo = isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import { isEnabled } from 'config';

				function fn(isEnabled) {
					const foo = isEnabled('foo');
				}` );
		} );

		test( 'should not replace usage of the provided flags when import is shadowed by variables', () => {
			const code = transform( `
				import { isEnabled } from 'config'

				function fn() {
					const isEnabled = somethingElse;
					const foo = isEnabled('foo');
				}` );

			expect( noIndent( code ) ).toBe( noIndent`
				import { isEnabled } from 'config';

				function fn() {
					const isEnabled = somethingElse;
					const foo = isEnabled('foo');
				}` );
		} );
	} );
} );
