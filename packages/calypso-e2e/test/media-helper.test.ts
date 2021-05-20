/**
 * @file Tests the MediaHelper functions using process.env and stubbed config file.
 * @author Edwin Takahashi
 */

/**
 * External dependencies
 */
import { describe, expect, test } from '@jest/globals';
import path from 'path';

/**
 * Internal dependencies
 */
import { getAssetDir, getScreenshotDir } from '../src/media-helper';

describe( `Test: getAssetDir`, function () {
	let env: NodeJS.ProcessEnv;

	beforeAll( async function () {
		env = process.env;
	} );

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
		async function ( { env_var, expected } ) {
			process.env.TEMP_ASSET_PATH = env_var;
			expect( getAssetDir() ).toBe( expected );
		}
	);

	test( 'Returns default value if environment variable not set', async function () {
		delete process.env.TEMP_ASSET_PATH;
		const expected = path.resolve( __dirname, '..' );
		expect( getAssetDir() ).toBe( expected );
	} );

	afterAll( function () {
		process.env = env;
	} );
} );

describe( `Test: getScreenshotDir`, function () {
	let env: NodeJS.ProcessEnv;

	beforeAll( async function () {
		env = process.env;
	} );

	test.each`
		temp_asset_path | screenshotdir      | expected
		${ '/tmp' }     | ${ 'screenshots' } | ${ '/tmp/screenshots' }
	`(
		'Returns $expected when environment variable is set to $temp_asset_path and $screenshotdir',
		async function ( { temp_asset_path, screenshotdir, expected } ) {
			process.env.TEMP_ASSET_PATH = temp_asset_path;
			process.env.SCREENSHOTDIR = screenshotdir;
			expect( getScreenshotDir() ).toBe( expected );
		}
	);

	// test( 'Returns default value if environment variable not set', async function () {
	// 	delete process.env.TEMP_ASSET_PATH;
	// 	const expected = path.resolve( __dirname, '..' );
	// 	expect( v() ).toBe( expected );
	// } );

	afterAll( function () {
		process.env = env;
	} );
} );
