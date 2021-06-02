/**
 * External dependencies
 */
import path from 'path';
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

/**
 * Internal dependencies
 */
import { getAssetDir, getScreenshotDir, getVideoDir } from '../src/media-helper';

let env: NodeJS.ProcessEnv;

beforeAll( function () {
	env = process.env;
} );

describe( 'MediaHelper Tests', function () {
	describe( `Test: getAssetDir`, function () {
		test.each`
			env_var                             | expected
			${ '/tmp' }                         | ${ '/tmp' }
			${ '/assets' }                      | ${ '/assets' }
			${ '/home/user/playwright_assets' } | ${ '/home/user/playwright_assets' }
			${ '/home/ユーザー/logs' }          | ${ '/home/ユーザー/logs' }
			${ '/home/使用人/logs' }            | ${ '/home/使用人/logs' }
			${ '/Users/willthiswork?' }         | ${ '/Users/willthiswork?' }
		`(
			'Returns $expected when environment variable is set to $env_var',
			function ( { env_var, expected } ) {
				process.env.TEMP_ASSET_PATH = env_var;
				expect( getAssetDir() ).toBe( expected );
			}
		);

		test( 'Returns default value if environment variable not set', function () {
			delete process.env.TEMP_ASSET_PATH;
			const expected = path.resolve( __dirname, '..' );
			expect( getAssetDir() ).toBe( expected );
		} );
	} );

	describe( `Test: getScreenshotDir`, function () {
		test.each`
			temp_asset_path          | screenshotdir      | expected
			${ '/tmp' }              | ${ 'screenshots' } | ${ '/tmp/screenshots' }
			${ '/' }                 | ${ 'scr' }         | ${ '/scr' }
			${ '/TestUser/assets/' } | ${ '' }            | ${ '/TestUser/assets/screenshots' }
			${ '' }                  | ${ 'screenshots' } | ${ path.resolve( __dirname, '..', 'screenshots' ) }
			${ '/' }                 | ${ '/' }           | ${ '/' }
			${ '' }                  | ${ '' }            | ${ path.resolve( __dirname, '..', 'screenshots' ) }
		`(
			'Returns $expected when environment variable is set to $temp_asset_path and $screenshotdir',
			function ( { temp_asset_path, screenshotdir, expected } ) {
				process.env.TEMP_ASSET_PATH = temp_asset_path;
				process.env.SCREENSHOTDIR = screenshotdir;
				expect( getScreenshotDir() ).toBe( expected );
			}
		);

		test( 'Returns default values from config if environment variable not set', function () {
			delete process.env.TEMP_ASSET_PATH;
			delete process.env.SCREENSHOTDIR;
			const expected = path.resolve( __dirname, '..', 'screenshots' );
			expect( getScreenshotDir() ).toBe( expected );
		} );
	} );

	describe( `Test: getVideoDir`, function () {
		test.each`
			temp_asset_path          | videodir      | expected
			${ '/tmp' }              | ${ 'videos' } | ${ '/tmp/videos' }
			${ '/' }                 | ${ 'vid' }    | ${ '/vid' }
			${ '/TestUser/assets/' } | ${ '' }       | ${ '/TestUser/assets/screenshots/videos' }
			${ '' }                  | ${ 'videos' } | ${ path.resolve( __dirname, '..', 'videos' ) }
			${ '/' }                 | ${ '/' }      | ${ '/' }
			${ '' }                  | ${ '' }       | ${ path.resolve( __dirname, '..', 'screenshots/videos' ) }
		`(
			'Returns $expected when environment variable is set to $temp_asset_path and $videodir',
			function ( { temp_asset_path, videodir, expected } ) {
				process.env.TEMP_ASSET_PATH = temp_asset_path;
				process.env.VIDEODIR = videodir;
				expect( getVideoDir() ).toBe( expected );
			}
		);

		test( 'Returns default values from config if environment variable not set', function () {
			delete process.env.TEMP_ASSET_PATH;
			delete process.env.VIDEODIR;
			const expected = path.resolve( __dirname, '..', 'screenshots/videos' );
			expect( getVideoDir() ).toBe( expected );
		} );
	} );
} );

afterAll( function () {
	process.env = env;
} );
