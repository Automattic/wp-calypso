/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { waitFor } from '@testing-library/react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Modal from 'react-modal';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { logToLogstash } from 'calypso/lib/logstash';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getDocumentHeadFormattedTitle } from 'calypso/state/document-head/selectors/get-document-head-formatted-title';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import availableFlows from '../registered-flows';
import { renderFlow, renderFlowRoot } from './helpers';
import './helpers/to-match-path-and-search-params';
import type { Flow } from '../internals/types';

// we need to save the original objects for later to not affect tests from other files
const originalLocation = window.location;
const originalScrollTo = window.scrollTo;

jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'react-modal' );
jest.mock( 'calypso/lib/analytics/signup' );
jest.mock( 'calypso/lib/guides/trigger-guides-for-step' );
jest.mock( 'calypso/lib/logstash' );
jest.mock( 'calypso/state/current-user/selectors', () => {
	const originalModule = jest.requireActual( 'calypso/state/current-user/selectors' );
	return {
		...originalModule,
		isUserLoggedIn: jest.fn(),
	};
} );
jest.mock( 'calypso/state/document-head/selectors/get-document-head-formatted-title' );
jest.mock( 'calypso/state/imports/url-analyzer/selectors' );
jest.mock( 'calypso/state/products-list/selectors' );
jest.mock( 'calypso/state/ui/selectors' );

const expectedLoginPath = `/start/account/${
	isEnabled( 'signup/social-first' ) ? 'user-social' : 'user'
}`;

/**
 * Flows that have a specific step that needs to be loaded before we redirect to a login.
 * This is most common for flows with an intro step.
 */
const FLOWS_WITH_SPECIFIC_STEPS_FOR_LOGIN: Record< string, string > = {
	newsletter: 'newsletterSetup',
	videopress: 'videomakerSetup',
};

/**
 * Flows that require a feature flag to be enabled for the flow to work.
 */
const FLOWS_BEHIND_FEATURE_FLAG: Record< string, boolean > = {
	'ai-assembler': isEnabled( 'calypso/ai-assembler' ),
};

/**
 * Flows that perform redirects to the user/login flow via a mechanism that we can't test yet.
 */
const FLOWS_WITH_ALT_LOGIN_REDIRECTS = [
	'entrepreneur', // TODO: redirect happens from submission
	'import-focused', // TODO: no login redirects
	'link-in-bio', // TODO: redirect happens from submission
	'link-in-bio-domain', // TODO: redirect happens from submission
	'link-in-bio-tld', // TODO: redirect happens from submission
	'videopress', // TODO: redirect happens from submission
];

/**
 * Flows that redirect to an alternative user/login flow.
 */
const FLOWS_WITH_ALTERNATE_USER_PATH: Record< string, string > = {
	videopress: '/start/videopress-account/user',
};

type AlternateLoggedOutDestination = {
	path: string;
	includeLocale: boolean;
	expectSearchParams?: boolean;
};

/**
 * Helper function to identify a non-standard target path for logged-out users.
 * In the long term, we want to minimise exceptions of this kind.
 *
 * @param flowKey The flow name/variation.
 * @param locale The current locale.
 * @returns The alternate path for logged-out users, or null if the default path should be used.
 */
const getAlternateLoggedOutDestination = ( flowKey: string, locale?: string ): string | null => {
	const FLOWS_WITH_ALTERNATE_LOGGED_OUT_DESTINATIONS: Record<
		string,
		AlternateLoggedOutDestination
	> = {
		wooexpress: {
			path: '/log-in',
			includeLocale: true,
			expectSearchParams: true,
		},
	};

	if ( ! FLOWS_WITH_ALTERNATE_LOGGED_OUT_DESTINATIONS[ flowKey ] ?? false ) {
		return null;
	}

	const { path, includeLocale, expectSearchParams } =
		FLOWS_WITH_ALTERNATE_LOGGED_OUT_DESTINATIONS[ flowKey ];

	if ( ! includeLocale || ! locale ) {
		if ( ! expectSearchParams ) {
			return path;
		}

		return expect.stringMatching( new RegExp( `^${ path }[^/]*` ) );
	}

	if ( ! expectSearchParams ) {
		return `${ path }/${ locale }`;
	}

	return expect.stringMatching( new RegExp( `^${ path }/${ locale }[^/]*` ) );
};

/* ===================================
   Identify and load all Stepper flows
   ===================================
 */
const flowKeys = Object.keys( availableFlows ).filter(
	( flowKey ) => FLOWS_BEHIND_FEATURE_FLAG[ flowKey ] ?? true
);

async function loadAllFlows() {
	return Promise.all( flowKeys.map( ( flowKey ) => availableFlows[ flowKey ]() ) );
}

/**
 * Initialise any flow-specific mocks. The goal is to make it easy to know which flows require
 * specific mocks/functions, rather than having them all polluting a central function.
 *
 * @param flow
 */
function initMocksForRootRender( flow: Flow ) {
	switch ( flow.name ) {
		case 'link-in-bio':
			( getSelectedSite as jest.Mock ).mockReturnValue( null );
			( getAvailableProductsList as jest.Mock ).mockReturnValue( {} );
			break;
	}
}

/**
 * The purpose of these tests is to dynamically ensure that all Stepper flows
 * that are flagged with isSignupFlow: true obey some basic requirements of signup flows,
 * including the following:
 *  - When redirecting to the login page, ensure that toStepper=true is included as a URL parameter
 *  - When a flow is loaded using an alternative locale, ensure that the login redirect includes that locale
 *
 */
describe( 'Stepper signup flows', () => {
	const signupFlows: Record< string, Flow > = {};

	beforeAll( async () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
		} );

		window.scrollTo = jest.fn();

		const loadedFlows = await loadAllFlows();

		flowKeys.forEach( ( flowKey, flowIndex ) => {
			const loadedFlow = loadedFlows[ flowIndex ];
			if ( ! loadedFlow || ! loadedFlow.default || ! loadedFlow.default.isSignupFlow ) {
				return;
			}

			signupFlows[ flowKey ] = loadedFlow.default;
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
		( window.scrollTo as jest.Mock ).mockClear();

		Object.defineProperty( window, 'scrollTo', originalScrollTo );
	} );

	beforeEach( () => {
		( window.location.assign as jest.Mock ).mockClear();
		window.location.search = '';
		( getDocumentHeadFormattedTitle as jest.Mock ).mockReturnValue( 'Test Title' );
		( recordSignupStart as jest.Mock ).mockClear();
	} );

	/*
	 * Loop over known flows and create tests.
	 * Note that for now we skip non-signup flows within the tests because
	 * we only load them all in beforeAll() - jest requires the initial test setup
	 * to be defined synchronosusly.
	 */
	flowKeys.forEach( ( flowKey ) => {
		describe( `flow: ${ flowKey }`, () => {
			const flowPath = flowKey;

			it( 'redirects the user to the login page when they are not logged in', () => {
				if ( ! signupFlows[ flowKey ] ) {
					return;
				}
				// We can't test flows with alternate redirect mechanisms yet.
				if ( FLOWS_WITH_ALT_LOGIN_REDIRECTS.includes( flowKey ) ) {
					return;
				}

				const flow = signupFlows[ flowKey ];

				( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( false );
				( isUserLoggedIn as jest.Mock ).mockReturnValue( false );

				const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321';
				window.location.search = searchValue;

				const currentStep = FLOWS_WITH_SPECIFIC_STEPS_FOR_LOGIN[ flowKey ] ?? undefined;

				const flowSubPath = currentStep ? `/${ currentStep }` : '';
				const currentURL = `/setup/${ flowPath }${ flowSubPath }${ searchValue }`;

				window.location.href = currentURL;
				window.location.pathname = `/setup/${ flowPath }${ flowSubPath }`;

				const { runUseAssertionCondition } = renderFlow( flow );
				runUseAssertionCondition( {
					currentStep,
					currentURL,
				} );

				const alternateLoggedOutDestination = getAlternateLoggedOutDestination( flowKey );
				if ( alternateLoggedOutDestination ) {
					// eslint-disable-next-line jest/no-conditional-expect
					expect( window.location.assign ).toHaveBeenCalledWith( alternateLoggedOutDestination );
					return;
				}

				expect( window.location.assign ).toHaveBeenCalledWith(
					expect.toMatchPathAndSearchParams(
						FLOWS_WITH_ALTERNATE_USER_PATH[ flowKey ] ?? expectedLoginPath,
						{
							variationName: flowPath,
							redirect_to: expect.stringContaining( `/setup/${ flowPath }` + flowSubPath ),
							toStepper: 'true',
						}
					)
				);
			} );

			it( 'redirects the user to the login page with the correct locale when they are not logged in', () => {
				if ( ! signupFlows[ flowKey ] ) {
					return;
				}
				// We can't test flows with alternate redirect mechanisms yet.
				if ( FLOWS_WITH_ALT_LOGIN_REDIRECTS.includes( flowKey ) ) {
					return;
				}

				const flow = signupFlows[ flowKey ];

				( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( false );
				( isUserLoggedIn as jest.Mock ).mockReturnValue( false );

				const currentStep = FLOWS_WITH_SPECIFIC_STEPS_FOR_LOGIN[ flowKey ] ?? undefined;

				const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321&locale=fr';
				window.location.search = searchValue;

				const flowSubPath = currentStep ? `/${ currentStep }` : '';
				const currentURL = `/setup/${ flowPath }${ flowSubPath }${ searchValue }`;

				window.location.href = currentURL;
				window.location.pathname = `/setup/${ flowPath }${ flowSubPath }`;

				const { runUseAssertionCondition } = renderFlow( flow );
				runUseAssertionCondition( {
					currentStep,
					currentURL,
				} );

				const alternateLoggedOutDestination = getAlternateLoggedOutDestination( flowKey, 'fr' );
				if ( alternateLoggedOutDestination ) {
					// eslint-disable-next-line jest/no-conditional-expect
					expect( window.location.assign ).toHaveBeenCalledWith( alternateLoggedOutDestination );
					return;
				}

				expect( window.location.assign ).toHaveBeenCalledWith(
					expect.toMatchPathAndSearchParams(
						( FLOWS_WITH_ALTERNATE_USER_PATH[ flowKey ] ?? expectedLoginPath ) + '/fr',
						{
							variationName: flowPath,
							redirect_to: expect.stringMatching(
								new RegExp(
									`^/setup/${ flowPath }${
										currentStep ? `/${ currentStep }` : ''
									}.*(\\?|\\&)locale=fr`
								)
							),
							toStepper: 'true',
						}
					)
				);
			} );

			it( 'triggers a calypso_signup_start event when loading a new flow for a logged-in user', () => {
				if ( ! signupFlows[ flowKey ] ) {
					return;
				}

				const flow = signupFlows[ flowKey ];

				( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
				( isUserLoggedIn as jest.Mock ).mockReturnValue( true );
				initMocksForRootRender( flow );

				const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321&locale=fr';
				window.location.search = searchValue;

				const currentURL = `/setup/${ flowPath }${ searchValue }`;

				window.location.href = currentURL;
				window.location.pathname = `/setup/${ flowPath }`;

				const { render } = renderFlowRoot( flow );
				render( { currentURL } );

				waitFor( () =>
					expect( recordSignupStart ).toHaveBeenCalledWith(
						flow.name, // Note that we ignore the variant name, which is used in the path
						'logged-out-homepage',
						expect.any( Object )
					)
				);
			} );

			it( 'triggers a calypso_signup_start event when loading a new flow for a logged-out user', () => {
				if ( ! signupFlows[ flowKey ] ) {
					return;
				}

				const flow = signupFlows[ flowKey ];

				( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( false );
				( isUserLoggedIn as jest.Mock ).mockReturnValue( false );
				initMocksForRootRender( flow );

				const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321&locale=fr';
				window.location.search = searchValue;

				const currentURL = `/setup/${ flowPath }${ searchValue }`;

				window.location.href = currentURL;
				window.location.pathname = `/setup/${ flowPath }`;

				const { render } = renderFlowRoot( flow );
				render( { currentURL } );

				waitFor( () =>
					expect( recordSignupStart ).toHaveBeenCalledWith(
						flow.name,
						'logged-out-homepage',
						expect.any( Object )
					)
				);
			} );

			it( 'does not trigger a calypso_signup_start event when loading a later step in a flow', () => {
				if ( ! signupFlows[ flowKey ] ) {
					return;
				}

				// The components we use to render the flow root need to get the steps
				// before we set up a Router component, so we're not allowed to call useLocation()
				// from that context.
				const FLOWS_WITH_LOCATION_HOOKS_IN_USE_STEPS = [ 'newsletter' ];

				if ( FLOWS_WITH_LOCATION_HOOKS_IN_USE_STEPS.includes( flowKey ) ) {
					return;
				}

				const flow = signupFlows[ flowKey ];

				( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
				( isUserLoggedIn as jest.Mock ).mockReturnValue( true );
				initMocksForRootRender( flow );

				const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321&locale=fr';
				window.location.search = searchValue;

				const currentURL = `/setup/${ flowPath }${ searchValue }`;

				window.location.href = currentURL;
				window.location.pathname = `/setup/${ flowPath }`;

				// Some flows have internal navigation logic that results in step 2
				// redirecting to the initial step, so we want a way to override the default of 2.
				const PREFERRED_STEP_INDEX_FOR_FLOWS = {
					'import-focused': 1,
				};

				const preferredStepIndex = PREFERRED_STEP_INDEX_FOR_FLOWS[ flow.name ] ?? 2;

				const { render } = renderFlowRoot( flow );
				render( { currentURL, preferredStepIndex } );

				waitFor( () => expect( recordSignupStart ).not.toHaveBeenCalled() );
			} );
		} );
	} );
} );
