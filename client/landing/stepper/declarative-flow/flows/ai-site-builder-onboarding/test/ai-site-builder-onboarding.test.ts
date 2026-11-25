/**
 * @vitest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { type Mock, vi } from 'vitest';
import wpcom from 'calypso/lib/wp';
import { persistSignupDestination } from 'calypso/signup/storageUtils';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import aiSiteBuilderOnboarding from '../ai-site-builder-onboarding';

let mockQueryParams = new URLSearchParams();

vi.mock( '@automattic/calypso-products', () => ( {
	isPersonalPlan: ( slug: string ) => slug.startsWith( 'personal-bundle' ),
	isPremiumPlan: ( slug: string ) => slug.startsWith( 'value_bundle' ),
	isBusinessPlan: ( slug: string ) => slug.startsWith( 'business-bundle' ),
	isEcommercePlan: ( slug: string ) => slug.startsWith( 'ecommerce-bundle' ),
} ) );

vi.mock( '@automattic/onboarding', () => ( {
	AI_SITE_BUILDER_ONBOARDING_FLOW: 'ai-site-builder-onboarding',
	clearStepPersistedState: vi.fn(),
} ) );

vi.mock( '@automattic/data-stores', () => ( {
	Onboard: { SiteIntent: { AIAssembler: 'ai-assembler' } },
} ) );

vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		req: { post: vi.fn(), get: vi.fn() },
	} )
);

vi.mock( '@wordpress/data', () => ( {
	dispatch: () => ( { resetOnboardStore: vi.fn() } ),
	useDispatch: vi.fn(),
	useSelect: vi.fn(),
	resolveSelect: vi.fn(),
} ) );

vi.mock( '../../../../hooks/use-query', () => ( {
	useQuery: () => mockQueryParams,
} ) );

vi.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

vi.mock( 'calypso/signup/storageUtils', () => ( {
	setSignupCompleteSlug: vi.fn(),
	persistSignupDestination: vi.fn(),
	setSignupCompleteFlowName: vi.fn(),
	setSignupCompleteSiteID: vi.fn(),
	clearSignupDestinationCookie: vi.fn(),
	clearSignupCompleteFlowName: vi.fn(),
	clearSignupCompleteSlug: vi.fn(),
	clearSignupCompleteSiteID: vi.fn(),
	getSignupCompleteSiteID: vi.fn(),
	getSignupCompleteSlug: vi.fn(),
} ) );

vi.mock( 'calypso/state/ui/actions', () => ( {
	setSelectedSiteId: vi.fn(),
} ) );

vi.mock( '../../../../utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

describe( 'ai-site-builder-onboarding flow', () => {
	const isEnabled = vi.spyOn( config, 'isEnabled' );

	it( 'initializes domain → plans → create-site → processing → error', async () => {
		const reduxStore = { dispatch: vi.fn(), getState: vi.fn() } as never;
		const steps = await aiSiteBuilderOnboarding.initialize( reduxStore );

		expect( steps.map( ( step ) => step.slug ) ).toEqual( [
			STEPS.DOMAIN_SEARCH.slug,
			STEPS.UNIFIED_PLANS.slug,
			STEPS.SITE_CREATION_STEP.slug,
			STEPS.PROCESSING.slug,
			STEPS.ERROR.slug,
		] );
	} );

	describe( 'processing → checkout', () => {
		const setStaticHomepageOnSite = vi.fn();
		const setIntentOnSite = vi.fn();

		const runProcessingSubmit = async () => {
			const navigate = vi.fn();
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
			new URL( ( window.location.assign as Mock ).mock.calls[ 0 ][ 0 ], 'https://wordpress.com' )
				.searchParams;

		const getRedirectTo = () => getCheckoutParams().get( 'redirect_to' ) as string;

		const setPlan = ( productSlug: string ) =>
			( useSelect as Mock ).mockReturnValue( { product_slug: productSlug } );

		beforeEach( () => {
			vi.clearAllMocks();
			mockQueryParams = new URLSearchParams();
			isEnabled.mockReturnValue( true );
			setPlan( 'business-bundle' );
			( wpcom.req.get as Mock ).mockResolvedValue( [ { id: 7 } ] );

			( useDispatch as Mock ).mockReturnValue( {
				setStaticHomepageOnSite,
				setIntentOnSite,
			} );
			( resolveSelect as Mock ).mockReturnValue( {
				getSite: vi.fn().mockResolvedValue( { URL: 'https://example.wordpress.com' } ),
			} );

			Object.defineProperty( window, 'location', {
				value: { assign: vi.fn(), replace: vi.fn() },
				writable: true,
			} );
		} );

		describe( 'legacy site editor destination', () => {
			beforeEach( () => {
				setPlan( 'pro-plan' );
			} );

			it( 'creates and sets a Home page when the site has none yet', async () => {
				( wpcom.req.get as Mock ).mockResolvedValue( [] );
				( wpcom.req.post as Mock ).mockResolvedValue( { id: 42 } );

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

			it.each( [
				'personal-bundle',
				'value_bundle',
				'business-bundle-monthly',
				'ecommerce-bundle-2y',
			] )( 'is used for the %s plan', async ( productSlug ) => {
				setPlan( productSlug );

				await runProcessingSubmit();

				expect( new URL( getRedirectTo(), 'https://wordpress.com' ).pathname ).toBe(
					'/setup/ai-site-builder-spec/site-spec'
				);
			} );

			it( 'sends a Commerce checkout to the build-wow site spec with ref, source, prompt and spec carried over', async () => {
				setPlan( 'ecommerce-bundle' );
				mockQueryParams = new URLSearchParams( {
					source: 'sites-dashboard',
					ref: 'new-site-popover',
					spec_id: 'spec-42',
				} );
				window.sessionStorage.setItem( 'stored_ai_prompt', 'a bakery store' );

				await runProcessingSubmit();

				const redirectTo = new URL( getRedirectTo(), 'https://wordpress.com' );
				expect( redirectTo.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
				expect( Object.fromEntries( redirectTo.searchParams ) ).toEqual( {
					build_wow: '1',
					siteSlug: 'example.wordpress.com',
					siteId: '123',
					ref: 'new-site-popover',
					source: 'sites-dashboard',
					prompt: 'a bakery store',
					graph: 'dsl',
					spec_id: 'spec-42',
				} );
				expect( persistSignupDestination ).toHaveBeenCalledWith( getRedirectTo() );
				expect( wpcom.req.get ).not.toHaveBeenCalled();
				expect( setIntentOnSite ).not.toHaveBeenCalled();
			} );

			it( 'is not used when the site-spec feature is off', async () => {
				isEnabled.mockImplementation( ( flag: string ) => flag !== 'site-spec' );

				await runProcessingSubmit();

				expect( new URL( getRedirectTo() ).pathname ).toBe( '/wp-admin/site-editor.php' );
				expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
			} );

			it( 'sends a Commerce checkout straight to the legacy editor when the site-spec feature is off', async () => {
				isEnabled.mockImplementation( ( flag: string ) => flag !== 'site-spec' );
				setPlan( 'ecommerce-bundle' );

				await runProcessingSubmit();

				expect( new URL( getRedirectTo() ).pathname ).toBe( '/wp-admin/site-editor.php' );
				expect( persistSignupDestination ).toHaveBeenCalledWith( getRedirectTo() );
			} );
		} );
	} );

	describe( 'error reasons', () => {
		const originalLocation = window.location;

		const submitFrom = async ( slug: string, providedDependencies: Record< string, unknown > ) => {
			const navigate = vi.fn();
			const { submit } = aiSiteBuilderOnboarding.useStepNavigation( slug as never, navigate );
			await submit?.( { slug, providedDependencies } as never );
			return navigate;
		};

		beforeEach( () => {
			vi.clearAllMocks();
			mockQueryParams = new URLSearchParams();
			isEnabled.mockReturnValue( true );
			( useSelect as Mock ).mockReturnValue( { product_slug: 'business-bundle' } );
			( useDispatch as Mock ).mockReturnValue( {
				setStaticHomepageOnSite: vi.fn(),
				setIntentOnSite: vi.fn(),
			} );
			Object.defineProperty( window, 'location', {
				value: { assign: vi.fn(), replace: vi.fn() },
				writable: true,
			} );
		} );

		afterEach( () => {
			( resolveSelect as Mock ).mockReset();
			Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
		} );

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
			( resolveSelect as Mock ).mockReturnValue( {
				getSite: vi.fn().mockResolvedValue( undefined ),
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
