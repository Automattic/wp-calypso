import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import {
	getTargetDeviceName,
	getLocale,
	getDevice,
	getLaunchConfiguration,
} from '../src/browser-helper';

let env: NodeJS.ProcessEnv;

beforeAll( function () {
	env = process.env;
} );

describe( 'BrowserHelper Tests', function () {
	describe( `Test: getTargetDeviceName`, function () {
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
			${ '"mobile"' }              | ${ '"mobile"' }
		`(
			'Returns $expected when environment variable is set to $env_var',
			function ( { env_var, expected } ) {
				process.env.TARGET_DEVICE = env_var;
				expect( getTargetDeviceName() ).toBe( expected );
			}
		);

		test( 'Returns default value found in config if environment variable not set', function () {
			delete process.env.TARGET_DEVICE;
			expect( getTargetDeviceName() ).toBe( 'desktop' );
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

	describe( `Test: getDevice`, function () {
		test.each`
			name           | expected_viewport                 | expected_isMobile
			${ 'desktop' } | ${ { width: 1280, height: 720 } } | ${ false }
			${ 'mobile' }  | ${ { width: 412, height: 765 } }  | ${ true }
		`(
			'Check expected values if target device is $name',
			function ( { name, expected_viewport, expected_isMobile } ) {
				const device = getDevice( name );
				expect( device.viewport ).toStrictEqual( expected_viewport );
				expect( device.isMobile ).toStrictEqual( expected_isMobile );
			}
		);

		test.each`
			name
			${ 'tablet' }
			${ 'MOBILE' }
			${ 'Desktop' }
		`( 'Throws error if unexpected target device', function ( { name } ) {
			expect( () => getDevice( name ) ).toThrow();
		} );
	} );

	describe( `Test: getLaunchConfiguration`, function () {
		test.each`
			name          | browser_version
			${ 'mobile' } | ${ `92.0.4515.131` }
		`(
			'Returns expected values in launch configuration for target device $name',
			function ( { name, browser_version } ) {
				process.env.TARGET_DEVICE = name;
				const expected_e2e_test_string = 'wp-e2e-tests';

				const config = getLaunchConfiguration( browser_version );
				expect( config.userAgent ).toContain( expected_e2e_test_string );
				expect( config.userAgent ).toContain( browser_version );
			}
		);
	} );
} );

afterAll( function () {
	process.env = env;
} );
