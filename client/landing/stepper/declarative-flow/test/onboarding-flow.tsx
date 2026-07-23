/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import config from '@automattic/calypso-config';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { addSurvicate } from 'calypso/lib/analytics/survicate';
import {
	persistSignupDestination,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import onboarding from '../flows/onboarding/onboarding';
import { STEPS } from '../internals/steps';
import { ProcessingResult } from '../internals/steps-repository/processing-step/constants';
import { getFlowLocation, renderFlow } from './helpers';

const originalLocation = window.location;

// Flags added to `enabledFlags` read as enabled on top of the test config. The set
// lives inside the factory because config is read while modules are still importing,
// long before a top-level `const` in this file would be initialized.
jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const enabledFlags = new Set();
	const configFn = ( key ) => actual( key );
	Object.assign( configFn, actual, {
		enabledFlags,
		isEnabled: ( flag ) => enabledFlags.has( flag ) || actual.isEnabled( flag ),
	} );
	return configFn;
} );

const { enabledFlags } = config;

jest.mock( '../../hooks/use-marketplace-theme-products', () => ( {
	useMarketplaceThemeProducts: () => ( {
		isLoading: false,
		selectedMarketplaceProduct: '',
		selectedMarketplaceProductCartItems: [],
		isMarketplaceThemeSubscriptionNeeded: false,
		isMarketplaceThemeSubscribed: false,
		isExternallyManagedThemeAvailable: false,
	} ),
} ) );

jest.mock( '../../hooks/use-simplified-onboarding', () => ( {
	isSimplifiedOnboarding: () => Promise.resolve( false ),
} ) );

jest.mock( 'calypso/lib/analytics/survicate', () => ( {
	addSurvicate: jest.fn(),
} ) );

// The processing step awaits the launchpad-personalization ExPlat assignment before redirecting.
// Resolve it synchronously to control (variationName: null) so the redirect fires within the test's
// tick instead of waiting on a real network fetch.
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn( () => Promise.resolve( { variationName: null } ) ),
} ) );

describe( 'Onboarding Flow', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'location', {
			value: {
				assign: jest.fn(),
				replace: jest.fn(),
				pathname: '/setup/onboarding',
				search: '',
				href: 'http://wordpress.com/setup/onboarding',
			},
			writable: true,
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	beforeEach( () => {
		jest.resetAllMocks();
		enabledFlags.clear();
	} );

	describe( 'Email verification step', () => {
		it( 'sends free-plan signups straight to site creation now that the gate comes later', () => {
			enabledFlags.add( 'onboarding/email-verification' );
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.UNIFIED_PLANS.slug,
				dependencies: { cartItems: null },
			} );

			expect( getFlowLocation().path ).toBe( `/${ STEPS.SITE_CREATION_STEP.slug }` );
		} );

		it( 'gates the dashboard on email confirmation once the free site is created', async () => {
			enabledFlags.add( 'onboarding/email-verification' );
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					processingResult: ProcessingResult.SUCCESS,
					siteSlug: 'test-site.wordpress.com',
					hasPluginByGoal: true,
					hasExternalTheme: false,
				},
			} );

			await waitFor( () =>
				expect( getFlowLocation().path ).toBe( `/${ STEPS.EMAIL_VERIFICATION.slug }` )
			);
			expect( window.location.replace ).not.toHaveBeenCalled();
		} );

		it( 'lands on the dashboard without a gate while the flag is off', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					processingResult: ProcessingResult.SUCCESS,
					siteSlug: 'test-site.wordpress.com',
					hasPluginByGoal: true,
					hasExternalTheme: false,
				},
			} );

			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( window.location.replace ).toHaveBeenCalledWith( '/home/test-site.wordpress.com' );
		} );

		it( 'sends the user on to the queued dashboard once the email step resolves', () => {
			enabledFlags.add( 'onboarding/email-verification' );
			persistSignupDestination( '/home/test-site.wordpress.com' );
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			runUseStepNavigationSubmit( {
				currentStep: STEPS.EMAIL_VERIFICATION.slug,
				dependencies: { emailVerified: true },
			} );

			expect( window.location.assign ).toHaveBeenCalledWith( '/home/test-site.wordpress.com' );
			clearSignupDestinationCookie();
		} );
	} );

	describe( 'Flow configuration', () => {
		it( 'should be configured as a signup flow', () => {
			expect( onboarding.name ).toBe( ONBOARDING_FLOW );
			expect( onboarding.isSignupFlow ).toBe( true );
		} );
	} );

	describe( 'Processing step navigation', () => {
		it( 'should redirect to home when hasPluginByGoal true and hasExternalTheme false', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					hasExternalTheme: false,
					hasPluginByGoal: true,
					siteSlug: 'test-site.wordpress.com',
					processingResult: ProcessingResult.SUCCESS,
				},
			} );

			// Wait for the next tick to allow async operations to complete
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( window.location.replace ).toHaveBeenCalledWith( '/home/test-site.wordpress.com' );
		} );

		it( 'should redirect to home when hasExternalTheme true', async () => {
			const { runUseStepNavigationSubmit } = renderFlow( onboarding );

			await runUseStepNavigationSubmit( {
				currentStep: STEPS.PROCESSING.slug,
				dependencies: {
					hasExternalTheme: true,
					siteSlug: 'test-site.wordpress.com',
					processingResult: ProcessingResult.SUCCESS,
				},
			} );

			// Wait for the next tick to allow async operations to complete
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( window.location.replace ).toHaveBeenCalledWith(
				'/home/test-site.wordpress.com?ref=onboarding'
			);
		} );

		describe( 'Survicate side effect', () => {
			it( 'calls addSurvicate with user data when logged in on step changes', () => {
				const loggedInState = {
					currentUser: {
						id: 123,
						user: {
							ID: 123,
							email: 'test@example.com',
							date: '2024-01-15T00:00:00+00:00',
						},
					},
				};

				const TestSideEffect = ( { step }: { step: string } ) => {
					onboarding.useSideEffect( step );
					return null;
				};

				const { rerender } = renderWithProvider(
					<MemoryRouter initialEntries={ [ '/setup/onboarding/domains' ] }>
						<TestSideEffect step={ STEPS.DOMAIN_SEARCH.slug } />
					</MemoryRouter>,
					{ initialState: loggedInState }
				);

				expect( addSurvicate ).toHaveBeenCalledTimes( 1 );
				expect( addSurvicate ).toHaveBeenCalledWith( {
					email: 'test@example.com',
					registrationDate: '2024-01-15T00:00:00+00:00',
					userId: 123,
				} );

				rerender(
					<MemoryRouter initialEntries={ [ '/setup/onboarding/plans' ] }>
						<TestSideEffect step={ STEPS.UNIFIED_PLANS.slug } />
					</MemoryRouter>
				);

				expect( addSurvicate ).toHaveBeenCalledTimes( 2 );
			} );
		} );
	} );
} );
