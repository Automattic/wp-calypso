/**
 * @jest-environment jsdom
 */

// Mock dependencies before importing the module
jest.mock( '@automattic/calypso-analytics', () => ( {
	getCurrentUser: jest.fn(),
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => jest.fn() );

jest.mock( '@automattic/viewport', () => ( {
	isMobile: jest.fn(),
} ) );

jest.mock( 'calypso/lib/i18n-utils', () => ( {
	getLocaleSlug: jest.fn(),
} ) );

jest.mock( 'debug', () => () => jest.fn() );

import { getCurrentUser, recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isMobile } from '@automattic/viewport';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';

describe( 'survicate', () => {
	let mockScript;
	let mockScriptElement;
	let originalCreateElement;
	let originalGetElementsByTagName;
	let mayWeLoadSurvicateScript;
	let addSurvicate;

	beforeAll( () => {
		// Set up DOM mocks
		originalCreateElement = document.createElement;
		originalGetElementsByTagName = document.getElementsByTagName;
	} );

	beforeEach( () => {
		// Reset all mocks
		jest.clearAllMocks();

		// Set up fresh module imports
		jest.isolateModules( () => {
			const survicateModule = require( 'calypso/lib/analytics/survicate' );
			mayWeLoadSurvicateScript = survicateModule.mayWeLoadSurvicateScript;
			addSurvicate = survicateModule.addSurvicate;
		} );

		// Mock DOM methods
		mockScript = {
			src: '',
			async: false,
			onload: null,
			onerror: null,
		};

		mockScriptElement = {
			parentNode: {
				insertBefore: jest.fn(),
			},
		};

		document.createElement = jest.fn( ( tagName ) => {
			if ( tagName === 'script' ) {
				return mockScript;
			}
			return originalCreateElement.call( document, tagName );
		} );

		document.getElementsByTagName = jest.fn( ( tagName ) => {
			if ( tagName === 'script' ) {
				return [ mockScriptElement ];
			}
			return originalGetElementsByTagName.call( document, tagName );
		} );

		// Reset global survicate object
		global._sva = undefined;

		// Mock setTimeout to be synchronous for testing
		jest.spyOn( global, 'setTimeout' ).mockImplementation( ( fn ) => fn() );
	} );

	afterEach( () => {
		// Restore setTimeout
		jest.restoreAllMocks();
	} );

	afterAll( () => {
		// Restore original DOM methods
		document.createElement = originalCreateElement;
		document.getElementsByTagName = originalGetElementsByTagName;
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
		} );

		test( 'should not load script for non-English languages', () => {
			getLocaleSlug.mockReturnValue( 'fr' );

			addSurvicate();

			expect( document.createElement ).not.toHaveBeenCalled();
		} );

		test( 'should not load script for non-English languages starting with different prefix', () => {
			getLocaleSlug.mockReturnValue( 'es-ES' );

			addSurvicate();

			expect( document.createElement ).not.toHaveBeenCalled();
		} );

		test( 'should load script for English language variants', () => {
			getLocaleSlug.mockReturnValue( 'en-US' );

			addSurvicate();

			expect( document.createElement ).toHaveBeenCalledWith( 'script' );
		} );

		test( 'should not load script on mobile devices', () => {
			isMobile.mockReturnValue( true );

			addSurvicate();

			expect( document.createElement ).not.toHaveBeenCalled();
		} );

		test( 'should not load script when survicate is disabled', () => {
			config.mockReturnValue( false );

			addSurvicate();

			expect( document.createElement ).not.toHaveBeenCalled();
		} );

		test( 'should create script element with correct properties', () => {
			addSurvicate();

			expect( document.createElement ).toHaveBeenCalledWith( 'script' );
			expect( mockScript.src ).toBe(
				'https://survey.survicate.com/workspaces/e4794374cce15378101b63de24117572/web_surveys.js'
			);
			expect( mockScript.async ).toBe( true );
			expect( mockScriptElement.parentNode.insertBefore ).toHaveBeenCalledWith(
				mockScript,
				mockScriptElement
			);
		} );

		test( 'should set visitor traits when script loads successfully with logged-in user', () => {
			const mockUser = {
				email: 'test@example.com',
			};
			getCurrentUser.mockReturnValue( mockUser );

			global._sva = {
				setVisitorTraits: jest.fn(),
			};

			addSurvicate();

			// Simulate script load
			mockScript.onload();

			expect( global._sva.setVisitorTraits ).toHaveBeenCalledWith( {
				email: 'test@example.com',
			} );
			expect( recordTracksEvent ).not.toHaveBeenCalled();
		} );

		test( 'should not set visitor traits when user is not logged in', () => {
			getCurrentUser.mockReturnValue( null );

			global._sva = {
				setVisitorTraits: jest.fn(),
			};

			addSurvicate();

			// Simulate script load
			mockScript.onload();

			expect( global._sva.setVisitorTraits ).not.toHaveBeenCalled();
		} );

		test( 'should log error when user is not logged in', () => {
			getCurrentUser.mockReturnValue( null );

			global._sva = {
				setVisitorTraits: jest.fn(),
			};

			addSurvicate();

			// Simulate script load
			mockScript.onload();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_survicate_user_not_available_error',
				{
					user_exists: false,
					user_has_email: false,
				}
			);
		} );

		test( 'should not set visitor traits when user has no email', () => {
			const mockUser = {
				id: 123,
			};
			getCurrentUser.mockReturnValue( mockUser );

			global._sva = {
				setVisitorTraits: jest.fn(),
			};

			addSurvicate();

			// Simulate script load
			mockScript.onload();

			expect( global._sva.setVisitorTraits ).not.toHaveBeenCalled();
		} );

		test( 'should log error when user has no email', () => {
			const mockUser = {
				id: 123,
			};
			getCurrentUser.mockReturnValue( mockUser );

			global._sva = {
				setVisitorTraits: jest.fn(),
			};

			addSurvicate();

			// Simulate script load
			mockScript.onload();

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_survicate_user_not_available_error',
				{
					user_exists: true,
					user_has_email: false,
				}
			);
		} );

		test( 'should handle case when _sva object is not available', () => {
			const mockUser = {
				email: 'test@example.com',
			};
			getCurrentUser.mockReturnValue( mockUser );

			// _sva is undefined
			global._sva = undefined;

			addSurvicate();

			// Simulate script load - should not throw error
			expect( () => mockScript.onload() ).not.toThrow();
		} );

		test( 'should handle case when _sva exists but setVisitorTraits is not available', () => {
			const mockUser = {
				email: 'test@example.com',
			};
			getCurrentUser.mockReturnValue( mockUser );

			global._sva = {}; // No setVisitorTraits method

			addSurvicate();

			// Simulate script load - should not throw error
			expect( () => mockScript.onload() ).not.toThrow();
		} );

		test( 'should handle script load error', () => {
			addSurvicate();

			// Simulate script error - should not throw
			expect( () => mockScript.onerror() ).not.toThrow();
		} );

		test( 'should use setTimeout for setting visitor traits', () => {
			const mockUser = {
				email: 'test@example.com',
			};
			getCurrentUser.mockReturnValue( mockUser );

			global._sva = {
				setVisitorTraits: jest.fn(),
			};

			// Restore real setTimeout for this test
			jest.restoreAllMocks();
			jest.spyOn( global, 'setTimeout' );

			addSurvicate();
			mockScript.onload();

			expect( setTimeout ).toHaveBeenCalledWith( expect.any( Function ), 1000 );
		} );

		test( 'should not load script twice when called multiple times', () => {
			// First call should create script
			addSurvicate();
			expect( document.createElement ).toHaveBeenCalledTimes( 1 );

			// Reset the mock to track subsequent calls
			document.createElement.mockClear();

			// Second call should not create another script
			addSurvicate();
			expect( document.createElement ).not.toHaveBeenCalled();
		} );
	} );
} );
