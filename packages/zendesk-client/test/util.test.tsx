/**
 * @jest-environment jsdom
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import config from '@automattic/calypso-config';
import { isInSupportSession } from '@automattic/data-stores';
import { isTestModeEnvironment } from '../src/util';

// Mock the config module - must be hoisted before imports
jest.mock( '@automattic/calypso-config', () => {
	return jest.fn();
} );

// Mock isInSupportSession - must be hoisted before imports
jest.mock( '@automattic/data-stores', () => ( {
	isInSupportSession: jest.fn(),
} ) );

describe( 'isTestModeEnvironment', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( isInSupportSession as jest.Mock ).mockReturnValue( false );
	} );

	describe( 'Support session override', () => {
		test( 'should return false (production) when in support session, regardless of environment', () => {
			( isInSupportSession as jest.Mock ).mockReturnValue( true );
			( config as unknown as jest.Mock ).mockImplementation( ( key: string ) => {
				if ( key === 'env_id' ) {
					return 'dashboard-development';
				}
				if ( key === 'env' ) {
					return 'development';
				}
				return undefined;
			} );

			expect( isTestModeEnvironment() ).toBe( false );
		} );
	} );

	describe( 'Test environments (development, horizon, stage)', () => {
		const testConfigFiles = [
			'stage',
			'horizon',
			'dashboard-development',
			'dashboard-horizon',
			'dashboard-stage',
			'jetpack-cloud-development',
			'jetpack-cloud-horizon',
			'jetpack-cloud-stage',
			'a8c-for-agencies-development',
			'a8c-for-agencies-horizon',
			'a8c-for-agencies-stage',
		];

		testConfigFiles.forEach( ( configFile ) => {
			test( `should return true (test mode) for ${ configFile }`, () => {
				// Path from packages/zendesk-client/test to config directory
				const configPath = join( __dirname, '../../../config', `${ configFile }.json` );
				const configData = JSON.parse( readFileSync( configPath, 'utf-8' ) );

				( config as unknown as jest.Mock ).mockImplementation( ( key: string ) => {
					if ( key === 'env_id' ) {
						return configData.env_id;
					}
					if ( key === 'env' ) {
						return configData.env;
					}
					return undefined;
				} );

				expect( isTestModeEnvironment() ).toBe( true );
			} );
		} );
	} );

	describe( 'Production environments', () => {
		const productionConfigFiles = [
			'production',
			'wpcalypso',
			'dashboard-production',
			'jetpack-cloud-production',
			'a8c-for-agencies-production',
		];

		productionConfigFiles.forEach( ( configFile ) => {
			test( `should return false (production) for ${ configFile }`, () => {
				// Path from packages/zendesk-client/test to config directory
				const configPath = join( __dirname, '../../../config', `${ configFile }.json` );
				const configData = JSON.parse( readFileSync( configPath, 'utf-8' ) );

				( config as unknown as jest.Mock ).mockImplementation( ( key: string ) => {
					if ( key === 'env_id' ) {
						return configData.env_id;
					}
					if ( key === 'env' ) {
						return configData.env;
					}
					return undefined;
				} );

				expect( isTestModeEnvironment() ).toBe( false );
			} );
		} );
	} );

	describe( 'Future-proof scenarios', () => {
		test( 'should automatically treat new production environment as production', () => {
			( config as unknown as jest.Mock ).mockImplementation( ( key: string ) => {
				if ( key === 'env_id' ) {
					return 'new-product-production';
				}
				if ( key === 'env' ) {
					return 'production';
				}
				return undefined;
			} );

			expect( isTestModeEnvironment() ).toBe( false );
		} );

		test( 'should automatically treat new test environment as test mode', () => {
			( config as unknown as jest.Mock ).mockImplementation( ( key: string ) => {
				if ( key === 'env_id' ) {
					return 'new-product-stage';
				}
				if ( key === 'env' ) {
					return 'production';
				}
				return undefined;
			} );

			expect( isTestModeEnvironment() ).toBe( true );
		} );
	} );
} );
