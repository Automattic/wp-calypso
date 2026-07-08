/**
 * @jest-environment jsdom
 */
import { resolveSelect, useDispatch } from '@wordpress/data';
import wpcom from 'calypso/lib/wp';
import { STEPS } from '../../../internals/steps';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import aiSiteBuilderOnboarding from '../ai-site-builder-onboarding';

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
	resolveSelect: jest.fn(),
} ) );

jest.mock( '../../../../hooks/use-query', () => ( {
	useQuery: () => ( { get: () => null } ),
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
} );
