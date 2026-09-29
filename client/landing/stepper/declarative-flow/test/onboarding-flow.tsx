/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { dispatch } from '@wordpress/data';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { WOO_HOSTING_SOLUTIONS_REF } from 'calypso/landing/stepper/constants';
import { addSurvicate } from 'calypso/lib/analytics/survicate';
import { retrieveSignupDestination } from 'calypso/signup/storageUtils';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ONBOARD_STORE } from '../../stores';
import onboarding from '../flows/onboarding/onboarding';
import { STEPS } from '../internals/steps';
import { ProcessingResult } from '../internals/steps-repository/processing-step/constants';
import { renderFlow } from './helpers';

let mockSiteOptions: Record< string, unknown > = {};
// A lazy Proxy, not a spread of requireActual: eagerly spreading '@wordpress/data' here recurses
// into its own mock factory while the module is still initializing (via @wordpress/rich-text's
// store, which the flow pulls in transitively) and crashes before any test runs.
jest.mock( '@wordpress/data', () => {
	const actualModule = jest.requireActual( '@wordpress/data' );

	return new Proxy( actualModule, {
		get: ( target, property ) => {
			if ( property === 'resolveSelect' ) {
				return () => ( {
					getSite: async () => ( {
						options: { admin_url: 'https://test-site.wordpress.com/wp-admin/', ...mockSiteOptions },
					} ),
				} );
			}
			return target[ property as keyof typeof target ];
		},
	} );
} );

const originalLocation = window.location;

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

// Only the plans-page experiment still uses ExPlat here; stub it so the flow's unconditional
// loadExperimentAssignment side effect never hits a real network fetch.
jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn( () => Promise.resolve( { variationName: null } ) ),
	// A plain function, not jest.fn: the suite's beforeEach resetAllMocks would wipe a jest.fn's
	// implementation, leaving useExperiment returning undefined (its tuple is destructured).
	useExperiment: () => [ false, null ],
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
		mockSiteOptions = {};
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

		describe( 'checkout back URLs', () => {
			const getCheckoutBackUrls = async ( currentURL?: string ) => {
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					currentURL,
					dependencies: {
						siteSlug: 'test-site.wordpress.com',
						siteId: 123,
						goToCheckout: true,
						processingResult: ProcessingResult.SUCCESS,
					},
				} );

				// Wait for the next tick to allow async operations to complete
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				const checkoutUrl = new URL( window.location.replace.mock.calls[ 0 ][ 0 ], 'http://x' );
				expect( checkoutUrl.pathname ).toBe( '/checkout/test-site.wordpress.com' );
				const toPath = ( url: string | null ) => {
					const { pathname, search } = new URL( url ?? '' );
					return pathname + search;
				};
				return {
					plans: toPath( checkoutUrl.searchParams.get( 'checkoutBackUrl' ) ),
					domains: toPath( checkoutUrl.searchParams.get( 'checkoutBackUrlDomains' ) ),
				};
			};

			const PLANS_STEP = '/setup/onboarding/plans?siteSlug=test-site.wordpress.com';
			const DOMAINS_STEP = '/setup/onboarding/domains?siteSlug=test-site.wordpress.com';

			beforeEach( () => {
				dispatch( ONBOARD_STORE ).resetOnboardStore();
				dispatch( ONBOARD_STORE ).setPlanCartItem( { product_slug: PLAN_PREMIUM } );
			} );

			it( 'goes back to the plans step', async () => {
				expect( await getCheckoutBackUrls() ).toEqual( {
					plans: PLANS_STEP,
					domains: DOMAINS_STEP,
				} );
			} );

			it( 'goes back to the plans step when the post-checkout destination is customised', async () => {
				expect(
					await getCheckoutBackUrls( '/setup/onboarding/processing?playground=abc' )
				).toEqual( {
					plans: PLANS_STEP,
					domains: DOMAINS_STEP,
				} );
				expect( retrieveSignupDestination() ).toContain( '/setup/site-setup/importerPlayground' );
			} );

			it( 'goes back to the domains step when the plans step was skipped', async () => {
				expect(
					await getCheckoutBackUrls( `/setup/onboarding/processing?plan=${ PLAN_PREMIUM }` )
				).toEqual( {
					plans: DOMAINS_STEP,
					domains: DOMAINS_STEP,
				} );
			} );
		} );

		describe( 'AI Launchpad and no-guidance destinations', () => {
			it( 'redirects to Site Setup wp-admin when AI Launchpad is enabled', async () => {
				mockSiteOptions = { wpcom_ai_launchpad_enabled: true };
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				await runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					dependencies: {
						siteSlug: 'test-site.wordpress.com',
						processingResult: ProcessingResult.SUCCESS,
					},
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				expect( window.location.replace ).toHaveBeenCalledWith(
					'https://test-site.wordpress.com/wp-admin/admin.php?page=site-setup-wp-admin'
				);
			} );

			it( 'redirects to the wp-admin root when the site has no guidance', async () => {
				mockSiteOptions = { wpcom_launchpad_no_guidance: true };
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				await runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					dependencies: {
						siteSlug: 'test-site.wordpress.com',
						processingResult: ProcessingResult.SUCCESS,
					},
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				expect( window.location.replace ).toHaveBeenCalledWith(
					'https://test-site.wordpress.com/wp-admin/'
				);
			} );

			it( 'keeps a Woo Hosting Solutions referral on wc-admin even when AI Launchpad is enabled', async () => {
				mockSiteOptions = { wpcom_ai_launchpad_enabled: true };
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				await runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					currentURL: `/some-path?siteSlug=test-site.wordpress.com&ref=${ WOO_HOSTING_SOLUTIONS_REF }`,
					dependencies: {
						siteSlug: 'test-site.wordpress.com',
						processingResult: ProcessingResult.SUCCESS,
					},
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				expect( window.location.replace ).toHaveBeenCalledWith(
					'https://test-site.wordpress.com/wp-admin/admin.php?page=wc-admin'
				);
			} );

			it( 'keeps the plans-step checkout back URL for a paid order on an AI Launchpad site', async () => {
				mockSiteOptions = { wpcom_ai_launchpad_enabled: true };
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				await runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					dependencies: {
						siteSlug: 'test-site.wordpress.com',
						siteId: 123,
						processingResult: ProcessingResult.SUCCESS,
						goToCheckout: true,
					},
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				const checkoutUrl = decodeURIComponent(
					( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ]
				);
				expect( checkoutUrl ).toContain( '/checkout/test-site.wordpress.com' );
				expect( checkoutUrl ).toContain( 'checkoutBackUrl=' );
				expect( checkoutUrl ).toContain( '/setup/onboarding/plans' );
			} );
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
