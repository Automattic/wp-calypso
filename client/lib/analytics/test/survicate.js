/**
 * @vitest-environment jsdom
 */

import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	isSurvicateScriptLoaded,
	setSurvicateVisitorTraits,
	getAccountAgeInDays,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import { vi } from 'vitest';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';

vi.mock( '@automattic/calypso-config', () => {
	const configMock = vi.fn();

	return {
		...Object.assign( configMock, {
			__esModule: true,
			default: configMock,
			isEnabled: configMock,
			config: configMock,
		} ),
	};
} );

vi.mock( '@automattic/viewport', () => ( {
	isMobile: vi.fn(),
} ) );

vi.mock( 'calypso/lib/i18n-utils', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		getLocaleSlug: vi.fn(),
	} )
);

vi.mock( '@automattic/survicate', () => ( {
	shouldLoadSurvicate: vi.fn(),
	loadSurvicateScript: vi.fn(),
	isSurvicateScriptLoaded: vi.fn(),
	setSurvicateVisitorTraits: vi.fn(),
	getAccountAgeInDays: vi.fn(),
	SURVICATE_WORKSPACE_ID: 'test-workspace-id',
} ) );

// Mock debug module used transitively by calypso-config.
vi.mock( 'debug', () => ( { default: () => vi.fn() } ) );

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

const mockUserData = {
	email: 'test@example.com',
	registrationDate: '2024-01-15T00:00:00+00:00',
	userId: 123,
};

describe( 'survicate', () => {
	let mayWeLoadSurvicateScript;
	let addSurvicate;

	beforeEach( async () => {
		// Reset all mocks
		vi.clearAllMocks();

		// Set up fresh module imports
		vi.resetModules();
		const survicateModule = await import( 'calypso/lib/analytics/survicate' );
		mayWeLoadSurvicateScript = survicateModule.mayWeLoadSurvicateScript;
		addSurvicate = survicateModule.addSurvicate;
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

		test( 'should set visitor traits with user_id, email and account_age_in_days when script loads', async () => {
			addSurvicate( mockUserData );
			await flushPromises();

			expect( getAccountAgeInDays ).toHaveBeenCalledWith( mockUserData.registrationDate );
			expect( setSurvicateVisitorTraits ).toHaveBeenCalledWith( {
				user_id: '123',
				email: 'test@example.com',
				account_age_in_days: 42,
			} );
		} );

		test( 'should omit user_id when no user ID is provided', async () => {
			addSurvicate( {
				email: mockUserData.email,
				registrationDate: mockUserData.registrationDate,
			} );
			await flushPromises();

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
				user_id: '123',
				email: 'test@example.com',
				account_age_in_days: 42,
			} );
		} );
	} );
} );
