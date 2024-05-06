/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Modal from 'react-modal';
import { useLocation } from 'react-router';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { logToLogstash } from 'calypso/lib/logstash';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getDocumentHeadFormattedTitle } from 'calypso/state/document-head/selectors/get-document-head-formatted-title';
import availableFlows from '../registered-flows';
import { renderFlow, renderFlowRoot } from './helpers';
import './helpers/to-match-path-and-search-params';
import type { Flow } from '../internals/types';

// we need to save the original objects for later to not affect tests from other files
const originalLocation = window.location;
const originalScrollTo = window.scrollTo;

jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'react-modal' );
jest.mock( 'react-router', () => {
	const originalModule = jest.requireActual( 'react-router' );
	return {
		...originalModule,
		useLocation: jest.fn(),
	};
} );
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

const expectedLoginPath = `/start/account/${
	isEnabled( 'signup/social-first' ) ? 'user-social' : 'user'
}`;

const FLOWS_WITH_SPECIFIC_STEPS_FOR_LOGIN: Record< string, string > = {
	newsletter: 'newsletterSetup',
	videopress: 'videomakerSetup',
};

const FLOWS_BEHIND_FEATURE_FLAG: Record< string, boolean > = {
	'ai-assembler': isEnabled( 'calypso/ai-assembler' ),
};

const FLOWS_WITH_ALTERNATE_USER_PATH: Record< string, string > = {
	videopress: '/start/videopress-account/user',
};

type AlternateLoggedOutDestination = {
	path: string;
	includeLocale: boolean;
	expectSearchParams?: boolean;
};

const getAlternateLoggedOutDestination = ( flowKey: string, locale?: string ): string | null => {
	const FLOWS_WITH_ALTERNATE_LOGGED_OUT_DESTINATIONS: Record<
		string,
		AlternateLoggedOutDestination
	> = {
		'import-hosted-site': {
			path: '/start/hosting',
			includeLocale: false,
		},
		'new-hosted-site': {
			path: '/start/hosting',
			includeLocale: false,
			expectSearchParams: true,
		},
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

const flowKeys = Object.keys( availableFlows ).filter(
	( flowKey ) => FLOWS_BEHIND_FEATURE_FLAG[ flowKey ] ?? true
);

async function loadAllFlows() {
	return Promise.all( flowKeys.map( ( flowKey ) => availableFlows[ flowKey ]() ) );
}

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
		( useLocation as jest.Mock ).mockClear();
		( window.scrollTo as jest.Mock ).mockClear();

		Object.defineProperty( window, 'scrollTo', originalScrollTo );
	} );

	beforeEach( () => {
		( window.location.assign as jest.Mock ).mockClear();
		window.location.search = '';
		( useLocation as jest.Mock ).mockReturnValue( window.location );
		( getDocumentHeadFormattedTitle as jest.Mock ).mockReturnValue( 'Test Title' );
	} );

	flowKeys.forEach( ( flowKey ) => {
		const FLOWS_TO_SKIP = [
			'entrepreneur', // TODO: redirect happens from submission
			'import-focused', // TODO: no login redirects
			'link-in-bio', // TODO: redirect happens from submission
			'link-in-bio-domain', // TODO: redirect happens from submission
			'link-in-bio-tld', // TODO: redirect happens from submission
			'videopress', // TODO: redirect happens from submission
		];
		if ( FLOWS_TO_SKIP.includes( flowKey ) ) {
			return;
		}

		describe( `flow: ${ flowKey }`, () => {
			const flowPath = flowKey;

			it( 'redirects the user to the login page when they are not logged in', () => {
				if ( ! signupFlows[ flowKey ] ) {
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
							/*
							vid: 'vid321',
							aff: 'aff123',
							ref: 'logged-out-homepage',
							*/
						}
					)
				);
			} );

			it( 'redirects the user to the login page with the correct locale when they are not logged in', () => {
				if ( ! signupFlows[ flowKey ] ) {
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
							/*
							vid: 'vid321',
							aff: 'aff123',
							ref: 'logged-out-homepage',
							*/
						}
					)
				);
			} );

			// This test is not working yet for logged-in or logged-out users.
			it.skip( 'triggers a signup start event when loading the flow for a logged-in user', () => {
				if ( ! signupFlows[ flowKey ] ) {
					return;
				}

				const flow = signupFlows[ flowKey ];

				( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
				( isUserLoggedIn as jest.Mock ).mockReturnValue( true );

				const searchValue = '?ref=logged-out-homepage&aff=aff123&vid=vid321&locale=fr';
				window.location.search = searchValue;

				const currentURL = `/setup/${ flowPath }${ searchValue }`;

				window.location.href = currentURL;
				window.location.pathname = `/setup/${ flowPath }`;

				const { renderWithAct } = renderFlowRoot( flow );
				renderWithAct( { currentURL } );

				expect( recordSignupStart ).toHaveBeenCalledWith(
					flowPath,
					'logged-out-homepage',
					expect.any( Object )
				);
			} );
		} );
	} );
} );
