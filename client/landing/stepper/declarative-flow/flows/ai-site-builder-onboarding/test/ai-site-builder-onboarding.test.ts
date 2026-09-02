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
const mockFetchIsAutomattician = jest.fn();

jest.mock( '@automattic/calypso-products', () => ( {
	isPremiumPlan: ( slug: string ) => slug.startsWith( 'value_bundle' ),
	isBusinessPlan: ( slug: string ) => slug.startsWith( 'business-bundle' ),
	isEcommercePlan: ( slug: string ) => slug.startsWith( 'ecommerce-bundle' ),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: () => ( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: jest.fn(),
	} ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: () => ( { refetch: mockFetchIsAutomattician } ),
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
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	setSelectedSiteId: jest.fn(),
} ) );

jest.mock( '../../../../utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

describe( 'ai-site-builder-onboarding flow', () => {
	const isEnabled = jest.spyOn( config, 'isEnabled' );

	it( 'initializes domain → plans → create-site → processing → error', async () => {
		const reduxStore = { dispatch: jest.fn(), getState: jest.fn() } as never;
		const steps = await aiSiteBuilderOnboarding.initialize( reduxStore );

		expect( steps.map( ( step ) => step.slug ) ).toEqual( [
			STEPS.DOMAIN_SEARCH.slug,
			STEPS.UNIFIED_PLANS.slug,
			STEPS.SITE_CREATION_STEP.slug,
			STEPS.PROCESSING.slug,
			STEPS.ERROR.slug,
		] );
	} );

	describe( 'processing → checkout site preparation', () => {
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

		beforeEach( () => {
			jest.clearAllMocks();
			mockQueryParams = new URLSearchParams();
			isEnabled.mockReturnValue( true );
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'business-bundle' } );
			mockFetchIsAutomattician.mockResolvedValue( { data: false } );

			( useDispatch as jest.Mock ).mockReturnValue( {
				setStaticHomepageOnSite,
				setIntentOnSite,
			} );
			( resolveSelect as jest.Mock ).mockReturnValue( {
				getSite: jest.fn().mockResolvedValue( { URL: 'https://example.wordpress.com' } ),
			} );

			Object.defineProperty( window, 'location', {
				value: { assign: jest.fn() },
				writable: true,
			} );
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
			( wpcom.req.get as jest.Mock ).mockResolvedValue( [ { id: 7 } ] );

			await runProcessingSubmit();

			expect( wpcom.req.post ).not.toHaveBeenCalled();
			expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
		} );

		it( 'routes checkout exit back into the flow instead of Big Sky', async () => {
			( wpcom.req.get as jest.Mock ).mockResolvedValue( [ { id: 7 } ] );
			window.sessionStorage.setItem( 'stored_ai_prompt', 'a bakery website' );

			await runProcessingSubmit();

			const checkoutUrl = ( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ];
			const checkoutParams = new URL( checkoutUrl, 'https://wordpress.com' ).searchParams;

			const redirectTo = new URL( checkoutParams.get( 'redirect_to' ) as string );
			const checkoutBackUrl = new URL( checkoutParams.get( 'checkoutBackUrl' ) as string );
			const checkoutBackUrlDomains = new URL(
				checkoutParams.get( 'checkoutBackUrlDomains' ) as string
			);

			// Success still lands in Big Sky.
			expect( redirectTo.searchParams.get( 'checkout' ) ).toBe( 'success' );
			expect( redirectTo.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );

			// Keeping the cart returns to the plan step; emptying it returns to
			// the domain step. Neither must point at Big Sky's site editor.
			expect( checkoutBackUrl.pathname ).toBe(
				`/setup/ai-site-builder-onboarding/${ STEPS.UNIFIED_PLANS.slug }`
			);
			expect( checkoutBackUrl.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );
			expect( checkoutBackUrl.pathname ).not.toContain( 'site-editor.php' );

			expect( checkoutBackUrlDomains.pathname ).toBe(
				`/setup/ai-site-builder-onboarding/${ STEPS.DOMAIN_SEARCH.slug }`
			);
			expect( checkoutBackUrlDomains.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );
			expect( checkoutBackUrlDomains.pathname ).not.toContain( 'site-editor.php' );
		} );
	} );

	describe( 'Automattician checkout destination', () => {
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

		const getRedirectTo = () =>
			new URL(
				( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ],
				'https://wordpress.com'
			).searchParams.get( 'redirect_to' ) as string;

		beforeEach( () => {
			jest.clearAllMocks();
			mockQueryParams = new URLSearchParams();
			isEnabled.mockReturnValue( true );
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'business-bundle' } );
			( wpcom.req.get as jest.Mock ).mockResolvedValue( [ { id: 7 } ] );

			( useDispatch as jest.Mock ).mockReturnValue( {
				setStaticHomepageOnSite,
				setIntentOnSite,
			} );
			( resolveSelect as jest.Mock ).mockReturnValue( {
				getSite: jest.fn().mockResolvedValue( { URL: 'https://example.wordpress.com' } ),
			} );

			Object.defineProperty( window, 'location', {
				value: { assign: jest.fn() },
				writable: true,
			} );
		} );

		it( 'sends Automatticians to the build-wow site spec after checkout', async () => {
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );
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
			} );
			expect( persistSignupDestination ).toHaveBeenCalledWith( getRedirectTo() );
		} );

		it( 'skips the Big Sky editor preparation for the build-wow destination', async () => {
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );

			await runProcessingSubmit();

			expect( wpcom.req.get ).not.toHaveBeenCalled();
			expect( wpcom.req.post ).not.toHaveBeenCalled();
			expect( setStaticHomepageOnSite ).not.toHaveBeenCalled();
			expect( setIntentOnSite ).not.toHaveBeenCalled();
		} );

		it( 'forwards the entry prompt to the build-wow site spec', async () => {
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );
			window.sessionStorage.setItem( 'stored_ai_prompt', 'a bakery website' );

			await runProcessingSubmit();

			const redirectTo = new URL( getRedirectTo(), 'https://wordpress.com' );
			expect( redirectTo.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
			expect( redirectTo.searchParams.get( 'prompt' ) ).toBe( 'a bakery website' );
			expect( window.sessionStorage.getItem( 'stored_ai_prompt' ) ).toBeNull();
		} );

		it( 'confirms a spec carried from entry on the build-wow site spec', async () => {
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );
			mockQueryParams = new URLSearchParams( { spec_id: 'spec-42' } );

			await runProcessingSubmit();

			const redirectTo = new URL( getRedirectTo(), 'https://wordpress.com' );
			expect( redirectTo.searchParams.get( 'build_wow' ) ).toBe( '1' );
			expect( redirectTo.searchParams.get( 'spec_id' ) ).toBe( 'spec-42' );
		} );

		it( 'keeps non-Automatticians in the Big Sky site editor', async () => {
			mockFetchIsAutomattician.mockResolvedValue( { data: false } );

			await runProcessingSubmit();

			const redirectTo = new URL( getRedirectTo() );
			expect( redirectTo.origin ).toBe( 'https://example.wordpress.com' );
			expect( redirectTo.pathname ).toBe( '/wp-admin/site-editor.php' );
			expect( redirectTo.searchParams.get( 'ai-step' ) ).toBe( 'spec' );
			expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
		} );

		it( 'falls back to the Big Sky site editor when the Automattician lookup fails', async () => {
			mockFetchIsAutomattician.mockResolvedValue( {
				data: undefined,
				isError: true,
				error: new Error( 'teams unavailable' ),
			} );

			await runProcessingSubmit();

			const redirectTo = new URL( getRedirectTo() );
			expect( redirectTo.pathname ).toBe( '/wp-admin/site-editor.php' );
			expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
			expect( wpcom.req.post ).toHaveBeenCalledWith(
				'/logstash',
				expect.objectContaining( { params: expect.stringContaining( 'lookup_failed' ) } )
			);
		} );

		it( 'keeps Automatticians on a Personal plan in the Big Sky site editor', async () => {
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'personal-bundle' } );
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );

			await runProcessingSubmit();

			expect( mockFetchIsAutomattician ).not.toHaveBeenCalled();
			expect( new URL( getRedirectTo() ).pathname ).toBe( '/wp-admin/site-editor.php' );
		} );

		it( 'routes Automatticians on a Premium plan to the build-wow site spec', async () => {
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'value_bundle' } );
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );

			await runProcessingSubmit();

			expect( new URL( getRedirectTo(), 'https://wordpress.com' ).pathname ).toBe(
				'/setup/ai-site-builder-spec/site-spec'
			);
		} );

		it( 'falls back to the Big Sky site editor when the Automattician lookup hangs', async () => {
			jest.useFakeTimers();
			try {
				mockFetchIsAutomattician.mockReturnValue( new Promise( () => {} ) );

				const run = runProcessingSubmit();
				await jest.advanceTimersByTimeAsync( 10_000 );
				await run;

				expect( new URL( getRedirectTo() ).pathname ).toBe( '/wp-admin/site-editor.php' );
				expect( wpcom.req.post ).toHaveBeenCalledWith(
					'/logstash',
					expect.objectContaining( { params: expect.stringContaining( 'timed out' ) } )
				);
			} finally {
				jest.useRealTimers();
			}
		} );

		it( 'keeps Automatticians in the Big Sky site editor when the site-spec feature is off', async () => {
			isEnabled.mockImplementation( ( flag: string ) => flag !== 'site-spec' );
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );

			await runProcessingSubmit();

			expect( mockFetchIsAutomattician ).not.toHaveBeenCalled();
			expect( new URL( getRedirectTo() ).pathname ).toBe( '/wp-admin/site-editor.php' );
		} );

		it( 'keeps Automatticians in the Big Sky site editor where the flag is off', async () => {
			isEnabled.mockImplementation(
				( flag: string ) => flag !== 'calypso/ai-site-builder-build-wow'
			);
			mockFetchIsAutomattician.mockResolvedValue( { data: true } );

			await runProcessingSubmit();

			expect( isEnabled ).toHaveBeenCalledWith( 'calypso/ai-site-builder-build-wow' );
			expect( mockFetchIsAutomattician ).not.toHaveBeenCalled();
			const redirectTo = new URL( getRedirectTo() );
			expect( redirectTo.pathname ).toBe( '/wp-admin/site-editor.php' );
			expect( setStaticHomepageOnSite ).toHaveBeenCalledWith( 123, 7 );
		} );
	} );
} );
