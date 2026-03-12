/**
 * @jest-environment jsdom
 */

// Mock dependencies before importing the module
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

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

jest.mock( '@automattic/i18n-utils', () => ( {
	localizeUrl: ( url ) => url,
} ) );

jest.mock( '@automattic/survicate', () => ( {
	shouldLoadSurvicate: jest.fn(),
	loadSurvicateScript: jest.fn(),
	isSurvicateScriptLoaded: jest.fn(),
	setSurvicateVisitorTraits: jest.fn(),
	getAccountAgeInDays: jest.fn(),
	SURVICATE_WORKSPACE_ID: 'test-workspace-id',
} ) );

jest.mock( '@wordpress/react-i18n', () => ( {
	useI18n: () => ( {
		__: ( text ) => text,
	} ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: () => jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	shouldLoadSurvicate,
	loadSurvicateScript,
	isSurvicateScriptLoaded,
	setSurvicateVisitorTraits,
	getAccountAgeInDays,
} from '@automattic/survicate';
import { isMobile } from '@automattic/viewport';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { HelpCenterMoreResources } from '../../../../packages/help-center/src/components/help-center-more-resources';
import { HelpCenterRequiredContextProvider } from '../../../../packages/help-center/src/contexts/HelpCenterContext';

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

	afterAll( () => {
		// Clean up document and window objects
		document.body.innerHTML = '';
		window.location = null;
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

describe( 'HelpCenterMoreResources', () => {
	let showHelpCenterFeedbackSurvey;
	const renderComponent = ( contextValue = {} ) =>
		render(
			<HelpCenterRequiredContextProvider
				value={ {
					sectionName: 'test-section',
					...contextValue,
				} }
			>
				<HelpCenterMoreResources />
			</HelpCenterRequiredContextProvider>
		);

	beforeEach( () => {
		delete window._sva;
		recordTracksEvent.mockClear();
		// Set up fresh module imports
		jest.isolateModules( () => {
			const survicateModule = require( 'calypso/lib/analytics/survicate' );
			showHelpCenterFeedbackSurvey = survicateModule.showHelpCenterFeedbackSurvey;
		} );
	} );

	afterEach( () => {
		delete window._sva;
	} );

	test( 'does not render feedback button when survicate is disabled', () => {
		const { queryByRole } = renderComponent( { haveSurvicateEnabled: false } );

		expect(
			queryByRole( 'button', {
				name: 'Share feedback',
			} )
		).toBeNull();
	} );

	test( 'does not render feedback button when survicate widget is unavailable', () => {
		const { queryByRole } = renderComponent( { haveSurvicateEnabled: true } );

		expect(
			queryByRole( 'button', {
				name: 'Share feedback',
			} )
		).toBeNull();
	} );

	test( 'renders feedback button and triggers survicate event when available', async () => {
		const invokeEvent = jest.fn();
		const addEventListener = jest.fn();
		const removeEventListener = jest.fn();
		const destroyVisitor = jest.fn();

		window._sva = {
			invokeEvent,
			addEventListener,
			removeEventListener,
			destroyVisitor,
		};

		const { queryByRole } = renderComponent( { haveSurvicateEnabled: true } );
		const button = queryByRole( 'button', {
			name: 'Share feedback',
		} );

		expect( button ).not.toBeNull();

		const user = userEvent.setup();
		if ( button ) {
			await user.click( button );
		}

		expect( invokeEvent ).toHaveBeenCalledWith( 'showFeedbackSurveyFromHelpCenter' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_help_moreresources_click',
			expect.objectContaining( {
				resource: 'feedback-survey',
				section: 'test-section',
			} )
		);
	} );

	test( 'does not invoke events when _sva is unavailable', () => {
		delete window._sva;

		// Should exit early without errors
		expect( () => showHelpCenterFeedbackSurvey() ).not.toThrow();
	} );

	test( 'invokes Survicate event and wires overlay click to destroy visitor', () => {
		const overlay = document.createElement( 'div' );
		overlay.className = 'sv__overlay sv__overlay--dark';

		const overlayAddEventListener = jest.fn();

		overlay.addEventListener = overlayAddEventListener;
		document.body.appendChild( overlay );

		let surveyDisplayedHandler;
		const invokeEvent = jest.fn();
		const destroyVisitor = jest.fn();
		const removeEventListener = jest.fn();
		const addEventListener = jest.fn( ( event, handler ) => {
			if ( event === 'survey_displayed' ) {
				surveyDisplayedHandler = handler;
			}
		} );

		document.querySelector = jest.fn( () => overlay );

		window._sva = {
			addEventListener,
			removeEventListener,
			invokeEvent,
			destroyVisitor,
		};

		showHelpCenterFeedbackSurvey();

		expect( addEventListener ).toHaveBeenCalled();
		expect( typeof surveyDisplayedHandler ).toBe( 'function' );
		expect( invokeEvent ).toHaveBeenCalledWith( 'showFeedbackSurveyFromHelpCenter' );

		// Simulate Survicate emitting the survey display event
		surveyDisplayedHandler?.();

		expect( overlayAddEventListener ).toHaveBeenCalled();
		const [ overlayCall ] = overlayAddEventListener.mock.calls;
		expect( overlayCall?.[ 0 ] ).toBe( 'click' );
		expect( typeof overlayCall?.[ 1 ] ).toBe( 'function' );
		expect( overlayCall?.[ 2 ] ).toEqual( { once: true } );

		overlayCall?.[ 1 ]?.();

		expect( destroyVisitor ).toHaveBeenCalled();
		expect( removeEventListener ).toHaveBeenCalled();
		const [ removeCall ] = removeEventListener.mock.calls;
		expect( removeCall?.[ 0 ] ).toBe( 'survey_displayed' );
		expect( removeCall?.[ 1 ] ).toBe( surveyDisplayedHandler );
	} );
} );
