/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import wpcom from 'calypso/lib/wp';
import { persistSignupDestination } from 'calypso/signup/storageUtils';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import aiSiteBuilderOnboarding from '../ai-site-builder-onboarding';

let mockQueryParams = new URLSearchParams();

jest.mock( '@automattic/calypso-products', () => ( {
	isPersonalPlan: ( slug: string ) => slug.startsWith( 'personal-bundle' ),
	isPremiumPlan: ( slug: string ) => slug.startsWith( 'value_bundle' ),
	isBusinessPlan: ( slug: string ) => slug.startsWith( 'business-bundle' ),
	isEcommercePlan: ( slug: string ) => slug.startsWith( 'ecommerce-bundle' ),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	AI_SITE_BUILDER_ONBOARDING_FLOW: 'ai-site-builder-onboarding',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	Onboard: { SiteIntent: { AIAssembler: 'ai-assembler' } },
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: { post: jest.fn(), get: jest.fn() },
} ) );

jest.mock( '@wordpress/data', () => ( {
	dispatch: () => ( { resetOnboardStore: jest.fn() } ),
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
	resolveSelect: jest.fn(),
} ) );

jest.mock( '../../../../hooks/use-query', () => ( {
	useQuery: () => mockQueryParams,
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	setSignupCompleteSlug: jest.fn(),
	persistSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSiteID: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
	getSignupCompleteSiteID: jest.fn(),
	getSignupCompleteSlug: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	setSelectedSiteId: jest.fn(),
} ) );

jest.mock( '../../../../utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

describe( 'ai-site-builder-onboarding flow', () => {
	const isEnabled = jest.spyOn( config, 'isEnabled' );

	it( 'initializes domain → plans → create-site → processing → Commerce wait → error', async () => {
		const reduxStore = { dispatch: jest.fn(), getState: jest.fn() } as never;
		const steps = await aiSiteBuilderOnboarding.initialize( reduxStore );

		expect( steps.map( ( step ) => step.slug ) ).toEqual( [
			STEPS.DOMAIN_SEARCH.slug,
			STEPS.UNIFIED_PLANS.slug,
			STEPS.SITE_CREATION_STEP.slug,
			STEPS.PROCESSING.slug,
			STEPS.WAIT_FOR_COMMERCE_ATOMIC.slug,
			STEPS.ERROR.slug,
		] );
	} );

	describe( 'processing → checkout', () => {
		const setStaticHomepageOnSite = jest.fn();
		const setIntentOnSite = jest.fn();

		const runProcessingSubmit = async () => {
			const navigate = jest.fn();
			const { submit } = aiSiteBuilderOnboarding.useStepNavigation(
				STEPS.PROCESSING.slug,
				navigate
			);

			await submit?.( {
				slug: STEPS.PROCESSING.slug,
				providedDependencies: {
					processingResult: ProcessingResult.SUCCESS,
					goToCheckout: true,
					siteId: 123,
					siteSlug: 'example.wordpress.com',
				},
			} as never );
		};

		const getCheckoutParams = () =>
			new URL(
				( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ],
				'https://wordpress.com'
			).searchParams;

		const getRedirectTo = () => getCheckoutParams().get( 'redirect_to' ) as string;

		const setPlan = ( productSlug: string ) =>
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: productSlug } );

		beforeEach( () => {
			jest.clearAllMocks();
			mockQueryParams = new URLSearchParams();
			isEnabled.mockReturnValue( true );
			setPlan( 'business-bundle' );
			( wpcom.req.get as jest.Mock ).mockResolvedValue( [ { id: 7 } ] );

			( useDispatch as jest.Mock ).mockReturnValue( {
				setStaticHomepageOnSite,
				setIntentOnSite,
			} );
			( resolveSelect as jest.Mock ).mockReturnValue( {
				getSite: jest.fn().mockResolvedValue( { URL: 'https://example.wordpress.com' } ),
			} );

			Object.defineProperty( window, 'location', {
				value: { assign: jest.fn(), replace: jest.fn() },
				writable: true,
			} );
		} );

		describe( 'legacy site editor destination', () => {
			beforeEach( () => {
				setPlan( 'pro-plan' );
			} );

			it( 'creates and sets a Home page when the site has none yet', async () => {
				( wpcom.req.get as jest.Mock ).mockResolvedValue( [] );
				( wpcom.req.post as jest.Mock ).mockResolvedValue( { id: 42 } );

				await runProcessingSubmit();

				expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
				expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 42 );
				expect( setIntentOnSite ).toHaveBeenCalledWith( 'example.wordpress.com', 'ai-assembler' );
			} );

			it( 'reuses the existing Home page instead of creating a duplicate on re-entry', async () => {
				await runProcessingSubmit();

				expect( wpcom.req.post ).not.toHaveBeenCalled();
				expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
			} );

			it( 'routes checkout exit back into the flow instead of Big Sky', async () => {
				window.sessionStorage.setItem( 'stored_ai_prompt', 'a bakery website' );

				await runProcessingSubmit();

				const checkoutParams = getCheckoutParams();
				const redirectTo = new URL( checkoutParams.get( 'redirect_to' ) as string );
				const checkoutBackUrl = new URL( checkoutParams.get( 'checkoutBackUrl' ) as string );
				const checkoutBackUrlDomains = new URL(
					checkoutParams.get( 'checkoutBackUrlDomains' ) as string
				);

				// Success still lands in Big Sky.
				expect( redirectTo.origin ).toBe( 'https://example.wordpress.com' );
				expect( redirectTo.pathname ).toBe( '/wp-admin/site-editor.php' );
				expect( redirectTo.searchParams.get( 'ai-step' ) ).toBe( 'spec' );
				expect( redirectTo.searchParams.get( 'checkout' ) ).toBe( 'success' );
				expect( redirectTo.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );

				// Keeping the cart returns to the plan step; emptying it returns to
				// the domain step. Neither must point at Big Sky's site editor.
				expect( checkoutBackUrl.pathname ).toBe(
					`/setup/ai-site-builder-onboarding/${ STEPS.UNIFIED_PLANS.slug }`
				);
				expect( checkoutBackUrl.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );
				expect( checkoutBackUrlDomains.pathname ).toBe(
					`/setup/ai-site-builder-onboarding/${ STEPS.DOMAIN_SEARCH.slug }`
				);
				expect( checkoutBackUrlDomains.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );
			} );

			it( 'stays on the legacy site editor for a plan without Atomic', async () => {
				await runProcessingSubmit();

				expect( new URL( getRedirectTo() ).pathname ).toBe( '/wp-admin/site-editor.php' );
				expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
			} );

			it( 'waits for Commerce readiness before opening the prepared editor', async () => {
				setPlan( 'ecommerce-bundle-2y' );
				await runProcessingSubmit();

				const waitUrl = new URL( getRedirectTo(), 'https://wordpress.com' );
				expect( waitUrl.pathname ).toBe(
					'/setup/ai-site-builder-onboarding/wait-for-commerce-atomic'
				);
				expect( waitUrl.searchParams.get( 'siteId' ) ).toBe( '123' );
				expect( waitUrl.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
				expect( persistSignupDestination ).toHaveBeenCalledWith( getRedirectTo() );
				const editorUrl = waitUrl.searchParams.get( 'redirect_to' ) as string;
				expect( new URL( editorUrl ).pathname ).toBe( '/wp-admin/site-editor.php' );

				mockQueryParams = waitUrl.searchParams;
				const navigate = jest.fn();
				const { submit } = aiSiteBuilderOnboarding.useStepNavigation(
					STEPS.WAIT_FOR_COMMERCE_ATOMIC.slug,
					navigate
				);
				await submit?.( {
					slug: STEPS.WAIT_FOR_COMMERCE_ATOMIC.slug,
					providedDependencies: { ready: true },
				} as never );

				expect( window.location.replace ).toHaveBeenCalledWith( editorUrl );
			} );
		} );

		describe( 'build-wow destination', () => {
			it( 'sends checkout to the build-wow site spec with source and ref carried over', async () => {
				mockQueryParams = new URLSearchParams( {
					source: 'sites-dashboard',
					ref: 'new-site-popover',
				} );

				await runProcessingSubmit();

				const redirectTo = new URL( getRedirectTo(), 'https://wordpress.com' );
				expect( redirectTo.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
				expect( Object.fromEntries( redirectTo.searchParams ) ).toEqual( {
					build_wow: '1',
					siteSlug: 'example.wordpress.com',
					siteId: '123',
					ref: 'new-site-popover',
					source: 'sites-dashboard',
					graph: 'dsl',
				} );
				expect( persistSignupDestination ).toHaveBeenCalledWith( getRedirectTo() );

				const checkoutBackUrl = new URL( getCheckoutParams().get( 'checkoutBackUrl' ) as string );
				expect( checkoutBackUrl.searchParams.get( 'ref' ) ).toBe( 'new-site-popover' );
			} );

			it( 'skips the Big Sky editor preparation', async () => {
				await runProcessingSubmit();

				expect( wpcom.req.get ).not.toHaveBeenCalled();
				expect( wpcom.req.post ).not.toHaveBeenCalled();
				expect( setStaticHomepageOnSite ).not.toHaveBeenCalled();
				expect( setIntentOnSite ).not.toHaveBeenCalled();
			} );

			it( 'forwards the entry prompt', async () => {
				window.sessionStorage.setItem( 'stored_ai_prompt', 'a bakery website' );

				await runProcessingSubmit();

				const redirectTo = new URL( getRedirectTo(), 'https://wordpress.com' );
				expect( redirectTo.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
				expect( redirectTo.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );
				expect( window.sessionStorage.getItem( 'stored_ai_prompt' ) ).toBeNull();
			} );

			it( 'confirms a spec carried from entry', async () => {
				mockQueryParams = new URLSearchParams( { spec_id: 'spec-42' } );

				await runProcessingSubmit();

				const redirectTo = new URL( getRedirectTo(), 'https://wordpress.com' );
				expect( redirectTo.searchParams.get( 'build_wow' ) ).toBe( '1' );
				expect( redirectTo.searchParams.get( 'spec_id' ) ).toBe( 'spec-42' );
			} );

			it.each( [ 'personal-bundle', 'value_bundle', 'business-bundle-monthly' ] )(
				'is used for the %s plan',
				async ( productSlug ) => {
					setPlan( productSlug );

					await runProcessingSubmit();

					expect( new URL( getRedirectTo(), 'https://wordpress.com' ).pathname ).toBe(
						'/setup/ai-site-builder-spec/site-spec'
					);
				}
			);

			describe( 'Commerce', () => {
				const storeBuilder = ( enabled: boolean ) =>
					( wpcom.req.get as jest.Mock ).mockImplementation( ( { path }: { path: string } ) =>
						Promise.resolve(
							path.endsWith( '/big-sky/build-wow/store-builder' ) ? { enabled } : [ { id: 7 } ]
						)
					);

				beforeEach( () => {
					setPlan( 'ecommerce-bundle' );
				} );

				it( 'sends a store builder account straight to the build-wow site spec, without the Commerce wait', async () => {
					storeBuilder( true );

					await runProcessingSubmit();

					expect( wpcom.req.get ).toHaveBeenCalledWith( {
						path: '/sites/123/big-sky/build-wow/store-builder',
						apiNamespace: 'wpcom/v2',
					} );
					const spec = new URL( getRedirectTo(), 'https://wordpress.com' );
					expect( spec.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
					expect( spec.searchParams.get( 'graph' ) ).toBe( 'dsl' );
					expect( persistSignupDestination ).toHaveBeenCalledWith( getRedirectTo() );
					expect( setIntentOnSite ).not.toHaveBeenCalled();
				} );

				it( 'still opens the build-wow site spec from a Commerce wait persisted before the skip', async () => {
					const specUrl = '/setup/ai-site-builder-spec/site-spec?build_wow=1';
					mockQueryParams = new URLSearchParams( {
						siteSlug: 'example.wordpress.com',
						redirect_to: specUrl,
					} );
					const navigate = jest.fn();
					const { submit } = aiSiteBuilderOnboarding.useStepNavigation(
						STEPS.WAIT_FOR_COMMERCE_ATOMIC.slug,
						navigate
					);
					await submit?.( {
						slug: STEPS.WAIT_FOR_COMMERCE_ATOMIC.slug,
						providedDependencies: { ready: true },
					} as never );

					expect( window.location.replace ).toHaveBeenCalledWith( specUrl );
					expect( navigate ).not.toHaveBeenCalled();
				} );

				it( 'keeps the legacy editor for an account the store rollout does not let in', async () => {
					storeBuilder( false );

					await runProcessingSubmit();

					const waitUrl = new URL( getRedirectTo(), 'https://wordpress.com' );
					expect( waitUrl.pathname ).toBe(
						'/setup/ai-site-builder-onboarding/wait-for-commerce-atomic'
					);
					const editorUrl = new URL( waitUrl.searchParams.get( 'redirect_to' ) as string );
					expect( editorUrl.pathname ).toBe( '/wp-admin/site-editor.php' );
				} );

				it( 'keeps the legacy editor when the store builder check fails', async () => {
					( wpcom.req.get as jest.Mock ).mockImplementation( ( { path }: { path: string } ) =>
						path.endsWith( '/big-sky/build-wow/store-builder' )
							? Promise.reject( new Error( 'network' ) )
							: Promise.resolve( [ { id: 7 } ] )
					);

					await runProcessingSubmit();

					const waitUrl = new URL( getRedirectTo(), 'https://wordpress.com' );
					expect( waitUrl.pathname ).toBe(
						'/setup/ai-site-builder-onboarding/wait-for-commerce-atomic'
					);
					const editorUrl = new URL( waitUrl.searchParams.get( 'redirect_to' ) as string );
					expect( editorUrl.pathname ).toBe( '/wp-admin/site-editor.php' );
				} );
			} );

			it( 'is not used when the site-spec feature is off', async () => {
				isEnabled.mockImplementation( ( flag: string ) => flag !== 'site-spec' );

				await runProcessingSubmit();

				expect( new URL( getRedirectTo() ).pathname ).toBe( '/wp-admin/site-editor.php' );
				expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
			} );
		} );
	} );

	describe( 'error reasons', () => {
		const originalLocation = window.location;

		const submitFrom = async ( slug: string, providedDependencies: Record< string, unknown > ) => {
			const navigate = jest.fn();
			const { submit } = aiSiteBuilderOnboarding.useStepNavigation( slug as never, navigate );
			await submit?.( { slug, providedDependencies } as never );
			return navigate;
		};

		beforeEach( () => {
			jest.clearAllMocks();
			mockQueryParams = new URLSearchParams();
			isEnabled.mockReturnValue( true );
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'business-bundle' } );
			( useDispatch as jest.Mock ).mockReturnValue( {
				setStaticHomepageOnSite: jest.fn(),
				setIntentOnSite: jest.fn(),
			} );
			Object.defineProperty( window, 'location', {
				value: { assign: jest.fn(), replace: jest.fn() },
				writable: true,
			} );
		} );

		afterEach( () => {
			( resolveSelect as jest.Mock ).mockReset();
			Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
		} );

		it.each( [
			[
				'siteSlug is missing',
				{ redirect_to: 'https://example.wordpress.com/wp-admin/site-editor.php' },
				'commerce_atomic_missing_site_slug',
			],
			[
				'redirect_to is missing',
				{ siteSlug: 'example.wordpress.com' },
				'commerce_atomic_missing_redirect',
			],
			[
				'redirect_to is not a URL',
				{ siteSlug: 'example.wordpress.com', redirect_to: 'not a url' },
				'commerce_atomic_invalid_redirect',
			],
			[
				'siteSlug is not a wordpress.com subdomain',
				{ siteSlug: 'example.com', redirect_to: 'https://example.com/wp-admin/site-editor.php' },
				'commerce_atomic_unexpected_site_slug',
			],
			[
				'redirect_to is not https',
				{
					siteSlug: 'example.wordpress.com',
					redirect_to: 'http://example.wordpress.com/wp-admin/site-editor.php',
				},
				'commerce_atomic_editor_url_not_https',
			],
			[
				'redirect_to is on another host',
				{
					siteSlug: 'example.wordpress.com',
					redirect_to: 'https://evil.example/wp-admin/site-editor.php',
				},
				'commerce_atomic_editor_host_mismatch',
			],
			[
				'redirect_to is not the site editor',
				{
					siteSlug: 'example.wordpress.com',
					redirect_to: 'https://example.wordpress.com/wp-admin/',
				},
				'commerce_atomic_editor_path_mismatch',
			],
		] )(
			'names the cause when the Commerce wait ends but %s',
			async ( _label, params, errorReason ) => {
				mockQueryParams = new URLSearchParams( params );

				const navigate = await submitFrom( STEPS.WAIT_FOR_COMMERCE_ATOMIC.slug, { ready: true } );

				expect( navigate ).toHaveBeenCalledWith( STEPS.ERROR.slug, { errorReason } );
				expect( window.location.replace ).not.toHaveBeenCalled();
			}
		);

		it( 'names the cause when processing fails', async () => {
			const navigate = await submitFrom( STEPS.PROCESSING.slug, {
				processingResult: ProcessingResult.FAILURE,
			} );

			expect( navigate ).toHaveBeenCalledWith(
				STEPS.ERROR.slug,
				{ errorReason: 'processing_failed' },
				true
			);
		} );

		it( 'replaces processing with the plans step when a reload drops the pending action', async () => {
			const navigate = await submitFrom( STEPS.PROCESSING.slug, {
				processingResult: ProcessingResult.NO_ACTION,
			} );

			expect( navigate ).toHaveBeenCalledTimes( 1 );
			expect( navigate ).toHaveBeenCalledWith( STEPS.UNIFIED_PLANS.slug, undefined, true );
		} );

		it( 'replaces create-site with processing so Back cannot create another site', async () => {
			const navigate = await submitFrom( STEPS.SITE_CREATION_STEP.slug, {} );

			expect( navigate ).toHaveBeenCalledWith( STEPS.PROCESSING.slug, undefined, true );
		} );

		it( 'names the cause when processing succeeds without a site', async () => {
			const navigate = await submitFrom( STEPS.PROCESSING.slug, {
				processingResult: ProcessingResult.SUCCESS,
				goToCheckout: true,
			} );

			expect( navigate ).toHaveBeenCalledWith(
				STEPS.ERROR.slug,
				{ errorReason: 'processing_missing_site' },
				true
			);
		} );

		it( 'names the cause when the created site cannot be loaded', async () => {
			( resolveSelect as jest.Mock ).mockReturnValue( {
				getSite: jest.fn().mockResolvedValue( undefined ),
			} );

			const navigate = await submitFrom( STEPS.PROCESSING.slug, {
				processingResult: ProcessingResult.SUCCESS,
				goToCheckout: true,
				siteId: 123,
				siteSlug: 'example.wordpress.com',
			} );

			expect( navigate ).toHaveBeenCalledWith(
				STEPS.ERROR.slug,
				{ errorReason: 'site_lookup_failed' },
				true
			);
		} );
	} );
} );
