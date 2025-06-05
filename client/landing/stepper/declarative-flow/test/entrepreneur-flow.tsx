/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { useEntrepreneurAdminDestination } from 'calypso/landing/stepper/hooks/use-entrepreneur-admin-destination';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import entrepreneurFlow from '../flows/entrepreneur-flow/entrepreneur-flow';
import { STEPS } from '../internals/steps';
import { getFlowLocation, renderFlow } from './helpers';

// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );

jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: jest.fn().mockReturnValue( {
		get: jest.fn(),
		set: jest.fn(),
		sessionId: '123',
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-entrepreneur-admin-destination', () => ( {
	useEntrepreneurAdminDestination: jest.fn(),
} ) );

describe( 'Entrepreneur Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: { ...originalLocation, assign: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		( window.location.assign as jest.Mock ).mockClear();
		window.location.search = '';
		( isCurrentUserLoggedIn as jest.Mock ).mockReturnValue( true );
		( useIsSiteOwner as jest.Mock ).mockReturnValue( {
			isOwner: true,
		} );

		( useEntrepreneurAdminDestination as jest.Mock ).mockReturnValue(
			'https://example.wpcomstaging.com/wp-login.php?action=jetpack-sso&redirect_to=https%3A%2F%2Fexample.wpcomstaging.com%2Fwp-admin%2Fadmin.php%3Fpage%3Dwc-admin%26path%3D%252Fcustomize-store%252Fdesign-with-ai%26ref%3Dentrepreneur-signup'
		);
	} );

	describe( 'useStepNavigation', () => {
		it( 'redirects the logged-in user to the trial acknowledge step from the survey step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: 'start' /* We use "start" as the survey step slug */,
				currentURL: '/setup/entrepreneur/start',
				dependencies: {
					lastQuestionPath: '#1',
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.TRIAL_ACKNOWLEDGE.slug }`,
				state: null,
			} );
		} );

		it( 'redirects the user to the processing step from the create-site step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.SITE_CREATION_STEP.slug,
				currentURL: '/setup/entrepreneur/create-site',
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }`,
				state: {
					currentStep: STEPS.SITE_CREATION_STEP.slug,
				},
			} );
		} );

		it( 'redirects the user to the wait-for-atomic step from the processing step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				currentURL: `/setup/entrepreneur/${ STEPS.PROCESSING.slug }?siteSlug=example.wordpress.com&siteId=1234`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.WAIT_FOR_ATOMIC.slug }?siteId=1234`,
				state: {
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
				},
			} );
		} );

		it( 'redirects the user to the processing step from the wait-for-atomic step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.WAIT_FOR_ATOMIC.slug,
				currentURL: `/setup/entrepreneur/${ STEPS.WAIT_FOR_ATOMIC.slug }?siteSlug=example.wordpress.com&siteId=1234`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }?siteId=1234`,
				state: {
					currentStep: STEPS.WAIT_FOR_ATOMIC.slug,
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
				},
			} );
		} );

		it( 'redirects the user to the wait-for-plugin-install step from the processing step when the Atomic site is ready', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				currentURL: `/setup/entrepreneur/${ STEPS.PROCESSING.slug }?siteSlug=example.wordpress.com&siteId=1234`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
					finishedWaitingForAtomic: true,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.WAIT_FOR_PLUGIN_INSTALL.slug }?siteId=1234`,
				state: {
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
				},
			} );
		} );

		it( 'redirects the user to the processing step from the wait-for-plugin-install step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.WAIT_FOR_PLUGIN_INSTALL.slug,
				currentURL: `/setup/entrepreneur/${ STEPS.WAIT_FOR_PLUGIN_INSTALL.slug }?siteSlug=example.wordpress.com&siteId=1234`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
				},
			} );

			expect( getFlowLocation() ).toEqual( {
				path: `/${ STEPS.PROCESSING.slug }?siteId=1234`,
				state: {
					currentStep: STEPS.WAIT_FOR_PLUGIN_INSTALL.slug,
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
				},
			} );
		} );

		it( 'redirects the user to the Jetpack SSO URL on the site step from the processing step when the plugins are installed', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				currentURL: `/setup/entrepreneur/${ STEPS.PROCESSING.slug }?siteSlug=example.wordpress.com&siteId=1234`,
				dependencies: {
					siteSlug: 'example.wordpress.com',
					siteId: 1234,
					pluginsInstalled: true,
				},
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				`https://example.wpcomstaging.com/wp-login.php?action=jetpack-sso&redirect_to=${ encodeURIComponent(
					'https://example.wpcomstaging.com/wp-admin/admin.php?page=wc-admin&path=%2Fcustomize-store%2Fdesign-with-ai&ref=entrepreneur-signup'
				) }`
			);
		} );
	} );
} );
