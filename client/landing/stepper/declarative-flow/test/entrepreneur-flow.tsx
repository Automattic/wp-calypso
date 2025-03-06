/**
 * @jest-environment jsdom
 */
import { isCurrentUserLoggedIn } from '@automattic/data-stores/src/user/selectors';
import { useIsSiteOwner } from 'calypso/landing/stepper/hooks/use-is-site-owner';
import entrepreneurFlow from '../entrepreneur-flow';
import { STEPS } from '../internals/steps';
import { getFlowLocation, renderFlow } from './helpers';

// we need to save the original object for later to not affect tests from other files
const originalLocation = window.location;

jest.mock( '../../utils/checkout' );
jest.mock( '@automattic/data-stores/src/user/selectors' );
jest.mock( 'calypso/landing/stepper/hooks/use-is-site-owner' );

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
	} );

	describe( 'useStepNavigation', () => {
		it( 'redirects the logged-in user to the trial acknowledge step from the survey step', () => {
			const { runUseStepNavigationSubmit } = renderFlow( entrepreneurFlow );

			runUseStepNavigationSubmit( {
				currentStep: 'start' /* We use "start" as the survey step slug */,
				currentURL: `/setup/entrepreneur/start`,
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
				currentURL: `/setup/entrepreneur/create-site`,
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
				path: `/${ STEPS.WAIT_FOR_ATOMIC.slug }`,
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
				path: `/${ STEPS.PROCESSING.slug }`,
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
				path: `/${ STEPS.WAIT_FOR_PLUGIN_INSTALL.slug }`,
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
				path: `/${ STEPS.PROCESSING.slug }`,
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
					`https://example.wpcomstaging.com/wp-admin/admin.php?page=wc-admin&path=%2Fcustomize-store%2Fdesign-with-ai&ref=entrepreneur-signup`
				) }`
			);
		} );
	} );
} );
