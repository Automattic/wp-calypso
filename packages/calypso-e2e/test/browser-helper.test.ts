/**
 * External dependencies
 */
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

/**
 * Internal dependencies
 */
import { getViewportName, getLocale, getViewportSize } from '../src/browser-helper';

let env: NodeJS.ProcessEnv;

beforeAll( function () {
	env = process.env;
} );

describe( 'BrowserHelper Tests', function () {
	describe( `Test: getViewportName`, function () {
		test.each`
			env_var                      | expected
			${ 'desktop' }               | ${ 'desktop' }
			${ 'mobile' }                | ${ 'mobile' }
			${ 'laptop' }                | ${ 'laptop' }
			${ 'tablet' }                | ${ 'tablet' }
			${ 'Desktop' }               | ${ 'desktop' }
			${ 'DESKTOP' }               | ${ 'desktop' }
			${ 'dEsKtoP' }               | ${ 'desktop' }
			${ 'non_existent_viewport' } | ${ 'non_existent_viewport' }
			${ 'TEST_ENV' }              | ${ 'test_env' }
		`(
			'Returns $expected when environment variable is set to $env_var',
			function ( { env_var, expected } ) {
				process.env.VIEWPORT_NAME = env_var;
				expect( getViewportName() ).toBe( expected );
			}
		);

		test( 'Returns default value found in config if environment variable not set', function () {
			delete process.env.VIEWPORT_NAME;
			expect( getViewportName() ).toBe( 'desktop' );
		} );
	} );

	describe( `Test: getLocale`, function () {
		test.each`
			env_var                 | expected
			${ 'en' }               | ${ 'en' }
			${ 'EN' }               | ${ 'en' }
			${ 'eN' }               | ${ 'en' }
			${ 'ja' }               | ${ 'ja' }
			${ 'unsupported_code' } | ${ 'unsupported_code' }
		`(
			'Returns $expected when environment variable is set to $env_var',
			function ( { env_var, expected } ) {
				process.env.LOCALE = env_var;
				expect( getLocale() ).toBe( expected );
			}
		);

		test( 'Returns default value found in config if environment variable not set', function () {
			delete process.env.LOCALE;
			expect( getLocale() ).toBe( 'en' );
		} );
	} );

	describe( `Test: getViewportSize`, function () {
		test.each`
			env_var        | expected_width | expected_height
			${ 'desktop' } | ${ 1440 }      | ${ 1000 }
			${ 'tablet' }  | ${ 1024 }      | ${ 1000 }
			${ 'mobile' }  | ${ 400 }       | ${ 1000 }
			${ 'laptop' }  | ${ 1440 }      | ${ 790 }
		`(
			'Returns expected dimensions when environment variable is set to $env_var',
			function ( { env_var, expected_width, expected_height } ) {
				process.env.VIEWPORT_NAME = env_var;
				const dimensions = getViewportSize();
				expect( dimensions.width ).toBe( expected_width );
				expect( dimensions.height ).toBe( expected_height );
			}
		);

		test.each`
			env_var
			${ 'unsupported_viewport' }
			${ 'desktop_variant' }
			${ 'm0bile' }
		`( 'Throws error when environment variable is set to $env_var', function ( { env_var } ) {
			process.env.VIEWPORT_NAME = env_var;
			expect( () => getViewportSize() ).toThrow();
		} );

		test( 'Returns default value based on config if environment variable not set', function () {
			delete process.env.VIEWPORT_NAME;
			// Defaults to 'desktop' as set in the stubbed config file.
			const dimensions = getViewportSize();
			expect( dimensions.width ).toBe( 1440 );
			expect( dimensions.height ).toBe( 1000 );
		} );
	} );
} );

afterAll( function () {
	process.env = env;
} );
