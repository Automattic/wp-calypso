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

let mockPostPlanSelectionEmailVerification = false;
jest.mock( '../internals/steps-repository/__user/use-email-verification-gate', () => ( {
	...jest.requireActual( '../internals/steps-repository/__user/use-email-verification-gate' ),
	useIsPostPlanSelectionEmailVerification: () => mockPostPlanSelectionEmailVerification,
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

		describe( 'post-checkout return URL', () => {
			const getReturnUrl = async () => {
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					dependencies: {
						siteSlug: 'test-site.wordpress.com',
						siteId: 123,
						goToCheckout: true,
						processingResult: ProcessingResult.SUCCESS,
					},
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				const checkoutUrl = new URL( window.location.replace.mock.calls[ 0 ][ 0 ], 'http://x' );
				return new URL( checkoutUrl.searchParams.get( 'redirect_to' ) ?? '', 'http://x' );
			};

			beforeEach( () => {
				dispatch( ONBOARD_STORE ).resetOnboardStore();
				dispatch( ONBOARD_STORE ).setPlanCartItem( { product_slug: PLAN_PREMIUM } );
			} );

			afterEach( () => {
				mockPostPlanSelectionEmailVerification = false;
			} );

			// Without the ID, a setup chooser choice made before the site loads hands
			// build-wow a site-spec URL with no siteId.
			it( 'carries the site ID to post-checkout onboarding', async () => {
				const returnUrl = await getReturnUrl();

				expect( returnUrl.pathname ).toBe( '/setup/onboarding/post-checkout-onboarding' );
				expect( returnUrl.searchParams.get( 'siteId' ) ).toBe( '123' );
			} );

			it( 'carries the site ID through email verification', async () => {
				mockPostPlanSelectionEmailVerification = true;
				const returnUrl = await getReturnUrl();

				expect( returnUrl.pathname ).toBe( '/setup/onboarding/email-verification' );
				expect( returnUrl.searchParams.get( 'siteId' ) ).toBe( '123' );
			} );

			it( 'carries the site ID when processing is reloaded with nothing pending', async () => {
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				await runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					currentURL: '/setup/onboarding/processing?siteSlug=test-site.wordpress.com&siteId=123',
					dependencies: { processingResult: ProcessingResult.NO_ACTION },
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				const resumeUrl = new URL( window.location.replace.mock.calls[ 0 ][ 0 ], 'http://x' );
				expect( resumeUrl.pathname ).toBe( '/setup/onboarding/post-checkout-onboarding' );
				expect( resumeUrl.searchParams.get( 'siteId' ) ).toBe( '123' );
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
				mockSiteOptions = { wpcom_ai_launchpad_no_guidance: true };
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

		describe( 'reblog destination', () => {
			const POST_URL = 'https://example.blog/2026/10/a-post/?utm_source=x&lang=es';
			const REBLOG_EDITOR = `/post/test-site.wordpress.com?url=${ encodeURIComponent( POST_URL ) }`;

			beforeEach( () => {
				mockPostPlanSelectionEmailVerification = false;
			} );

			const finishProcessing = async ( dependencies: Record< string, unknown > ) => {
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				await runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					currentURL: `/setup/onboarding/processing?blog_post=${ encodeURIComponent( POST_URL ) }&ref=reblog`,
					dependencies: {
						siteSlug: 'test-site.wordpress.com',
						siteId: 123,
						processingResult: ProcessingResult.SUCCESS,
						...dependencies,
					},
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				return ( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ];
			};

			// Without this, a free site eligible for the AI builder stops at the setup chooser.
			it( 'lands a free site in the editor with the post to reblog', async () => {
				expect( await finishProcessing( { postCheckoutBigSky: true } ) ).toBe( REBLOG_EDITOR );
			} );

			// Without this, checkout returns to the setup chooser and the post is lost.
			it( 'sends a paid site from checkout straight to the editor', async () => {
				const checkoutUrl = new URL( await finishProcessing( { goToCheckout: true } ), 'http://x' );

				expect( checkoutUrl.searchParams.get( 'redirect_to' ) ).toBe( REBLOG_EDITOR );
			} );

			// Without this, refreshing processing on the way back from checkout forgets the post.
			it( 'keeps the post when processing is reloaded with nothing pending', async () => {
				const { runUseStepNavigationSubmit } = renderFlow( onboarding );

				await runUseStepNavigationSubmit( {
					currentStep: STEPS.PROCESSING.slug,
					currentURL: `/setup/onboarding/processing?siteSlug=test-site.wordpress.com&blog_post=${ encodeURIComponent(
						POST_URL
					) }`,
					dependencies: { processingResult: ProcessingResult.NO_ACTION },
				} );
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

				const resumeUrl = new URL(
					( window.location.replace as jest.Mock ).mock.calls[ 0 ][ 0 ],
					'http://x'
				);
				expect( resumeUrl.pathname ).toBe( '/setup/onboarding/post-checkout-onboarding' );
				expect( resumeUrl.searchParams.get( 'blog_post' ) ).toBe( POST_URL );
			} );

			// Without this, leaving checkout to change the plan or domain forgets the post.
			it( 'keeps the post on checkout back URLs', async () => {
				const checkoutUrl = new URL( await finishProcessing( { goToCheckout: true } ), 'http://x' );

				for ( const backUrl of [ 'checkoutBackUrl', 'checkoutBackUrlDomains' ] ) {
					const back = new URL( checkoutUrl.searchParams.get( backUrl ) ?? '' );
					expect( back.searchParams.get( 'blog_post' ) ).toBe( POST_URL );
					expect( back.searchParams.get( 'ref' ) ).toBe( 'reblog' );
				}
			} );

			// Without this, a reblog order skips the post-plan email-verification gate.
			it( 'returns a paid site through email verification, keeping the post', async () => {
				mockPostPlanSelectionEmailVerification = true;
				const checkoutUrl = new URL( await finishProcessing( { goToCheckout: true } ), 'http://x' );
				const returnUrl = new URL(
					checkoutUrl.searchParams.get( 'redirect_to' ) ?? '',
					'http://x'
				);

				expect( returnUrl.pathname ).toBe( '/setup/onboarding/email-verification' );
				expect( returnUrl.searchParams.get( 'blog_post' ) ).toBe( POST_URL );
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
