/**
 * @jest-environment jsdom
 */

// Mock dependencies before importing the module
jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn();

	return Object.assign( config, {
		__esModule: true,
		default: config,
		isEnabled: config,
		config,
	} );
} );

jest.mock( '@automattic/viewport', () => ( {
	isMobile: jest.fn(),
} ) );

jest.mock( 'calypso/lib/i18n-utils', () => ( {
	getLocaleSlug: jest.fn(),
} ) );

jest.mock( '@automattic/survicate', () => ( {
	shouldLoadSurvicate: jest.fn(),
	loadSurvicateScript: jest.fn(),
	isSurvicateScriptLoaded: jest.fn(),
	setSurvicateVisitorTraits: jest.fn(),
	getAccountAgeInDays: jest.fn(),
	SURVICATE_WORKSPACE_ID: 'test-workspace-id',
} ) );

// Mock debug module used transitively by calypso-config.
jest.mock( 'debug', () => () => jest.fn() );

import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	isSurvicateScriptLoaded,
	setSurvicateVisitorTraits,
	getAccountAgeInDays,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

const mockUserData = {
	email: 'test@example.com',
	registrationDate: '2024-01-15T00:00:00+00:00',
};

describe( 'survicate', () => {
	let mayWeLoadSurvicateScript;
	let addSurvicate;

	beforeEach( () => {
		// Reset all mocks
		jest.clearAllMocks();

		// Set up fresh module imports
		jest.isolateModules( () => {
			const survicateModule = require( 'calypso/lib/analytics/survicate' );
			mayWeLoadSurvicateScript = survicateModule.mayWeLoadSurvicateScript;
			addSurvicate = survicateModule.addSurvicate;
		} );
	} );

	describe( 'mayWeLoadSurvicateScript', () => {
		test( 'should return true when survicate is enabled in config', () => {
			config.mockReturnValue( true );

			expect( mayWeLoadSurvicateScript() ).toBe( true );
			expect( config ).toHaveBeenCalledWith( 'survicate_enabled' );
		} );

		test( 'should return false when survicate is disabled in config', () => {
			config.mockReturnValue( false );

			expect( mayWeLoadSurvicateScript() ).toBe( false );
			expect( config ).toHaveBeenCalledWith( 'survicate_enabled' );
		} );
	} );

	describe( 'addSurvicate', () => {
		beforeEach( () => {
			// Set default mocks for successful loading
			getLocaleSlug.mockReturnValue( 'en' );
			isMobile.mockReturnValue( false );
			config.mockReturnValue( true );
			shouldLoadSurvicate.mockReturnValue( true );
			isSurvicateScriptLoaded.mockReturnValue( false );
			loadSurvicateScript.mockResolvedValue();
			getAccountAgeInDays.mockReturnValue( 42 );
		} );

		test( 'should not load script for non-English languages', () => {
			shouldLoadSurvicate.mockReturnValue( false );
			getLocaleSlug.mockReturnValue( 'fr' );

			addSurvicate( mockUserData );

			expect( loadSurvicateScript ).not.toHaveBeenCalled();
		} );

		test( 'should not load script for non-English languages starting with different prefix', () => {
			shouldLoadSurvicate.mockReturnValue( false );
			getLocaleSlug.mockReturnValue( 'es-ES' );

			addSurvicate( mockUserData );

			expect( loadSurvicateScript ).not.toHaveBeenCalled();
		} );

		test( 'should load script for English language variants', () => {
			getLocaleSlug.mockReturnValue( 'en-US' );

			addSurvicate( mockUserData );

			expect( loadSurvicateScript ).toHaveBeenCalledWith( 'test-workspace-id' );
		} );

		test( 'should not load script on mobile devices', () => {
			shouldLoadSurvicate.mockReturnValue( false );
			isMobile.mockReturnValue( true );

			addSurvicate( mockUserData );

			expect( loadSurvicateScript ).not.toHaveBeenCalled();
		} );

		test( 'should not load script when survicate is disabled', () => {
			config.mockReturnValue( false );

			addSurvicate( mockUserData );

			expect( loadSurvicateScript ).not.toHaveBeenCalled();
		} );

		test( 'should call loadSurvicateScript with workspace ID', () => {
			addSurvicate( mockUserData );

			expect( loadSurvicateScript ).toHaveBeenCalledWith( 'test-workspace-id' );
		} );

		test( 'should set visitor traits with email and account_age_in_days when script loads', async () => {
			addSurvicate( mockUserData );
			await flushPromises();

			expect( getAccountAgeInDays ).toHaveBeenCalledWith( mockUserData.registrationDate );
			expect( setSurvicateVisitorTraits ).toHaveBeenCalledWith( {
				email: 'test@example.com',
				account_age_in_days: 42,
			} );
		} );

		test( 'should handle script load error', async () => {
			loadSurvicateScript.mockRejectedValue( new Error( 'load failed' ) );

			addSurvicate( mockUserData );
			await expect( flushPromises() ).resolves.toBeUndefined();
		} );

		test( 'should not load script twice when called multiple times', () => {
			// First call should load script
			addSurvicate( mockUserData );
			expect( loadSurvicateScript ).toHaveBeenCalledTimes( 1 );

			// Second call: script is now "loaded"
			isSurvicateScriptLoaded.mockReturnValue( true );
			addSurvicate( mockUserData );

			// loadSurvicateScript should still have been called only once
			expect( loadSurvicateScript ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'should set visitor traits without reloading script when script is already loaded', async () => {
			// Script is already loaded
			isSurvicateScriptLoaded.mockReturnValue( true );

			addSurvicate( mockUserData );
			await flushPromises();

			// Should have called setSurvicateVisitorTraits without loading script again
			expect( loadSurvicateScript ).not.toHaveBeenCalled();
			expect( setSurvicateVisitorTraits ).toHaveBeenCalledWith( {
				email: 'test@example.com',
				account_age_in_days: 42,
			} );
		} );
	} );
} );
