/**
 * @jest-environment jsdom
 */
import { clearStepPersistedState } from '@automattic/onboarding';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useAddBlogStickerMutation } from 'calypso/blocks/blog-stickers/use-add-blog-sticker-mutation';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import {
	getSignupCompleteFlowName,
	getSignupCompleteSiteID,
	getSignupCompleteSlug,
	retrieveSignupDestination,
	wasSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import aiSiteBuilderPaidOnly from '../ai-site-builder-paid-only';

const mockIsBusinessPlan = jest.fn< boolean, [ string ] >( () => false );
const mockIsEcommercePlan = jest.fn< boolean, [ string ] >( () => false );
jest.mock( '@automattic/calypso-products', () => ( {
	isBusinessPlan: ( slug: string ) => mockIsBusinessPlan( slug ),
	isEcommercePlan: ( slug: string ) => mockIsEcommercePlan( slug ),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	Onboard: { SiteIntent: { AIAssembler: 'build' } },
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	AI_SITE_BUILDER_FLOW: 'ai-site-builder',
	clearStepPersistedState: jest.fn(),
} ) );

jest.mock( '@automattic/shopping-cart', () => ( {} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
	resolveSelect: jest.fn(),
} ) );

jest.mock( 'calypso/blocks/blog-stickers/use-add-blog-sticker-mutation', () => ( {
	useAddBlogStickerMutation: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn().mockResolvedValue( { id: 10 } ) } },
} ) );

jest.mock( 'calypso/signup/storageUtils', () => ( {
	clearSignupCompleteFlowName: jest.fn(),
	clearSignupCompleteSiteID: jest.fn(),
	clearSignupCompleteSlug: jest.fn(),
	clearSignupDestinationCookie: jest.fn(),
	getSignupCompleteFlowName: jest.fn(),
	getSignupCompleteSiteID: jest.fn(),
	getSignupCompleteSlug: jest.fn(),
	persistSignupDestination: jest.fn(),
	retrieveSignupDestination: jest.fn(),
	setSignupCompleteFlowName: jest.fn(),
	setSignupCompleteSiteID: jest.fn(),
	setSignupCompleteSlug: jest.fn(),
	wasSignupCheckoutPageUnloaded: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/state/ui/actions', () => ( {
	setSelectedSiteId: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/utils/steps-with-required-login', () => ( {
	stepsWithRequiredLogin: ( steps: unknown ) => steps,
} ) );

jest.mock( '../../../internals/steps', () => ( {
	STEPS: {
		DOMAIN_SEARCH: { slug: 'domains' },
		UNIFIED_PLANS: { slug: 'plans' },
		SITE_CREATION_STEP: { slug: 'create-site' },
		PROCESSING: { slug: 'processing' },
		ERROR: { slug: 'error' },
	},
} ) );

const onboardActions = {
	setDomain: jest.fn(),
	setDomainCartItem: jest.fn(),
	setDomainCartItems: jest.fn(),
	setPlanCartItem: jest.fn(),
	setProductCartItems: jest.fn(),
	setSiteUrl: jest.fn(),
	setSignupDomainOrigin: jest.fn(),
};
const siteActions = {
	setStaticHomepageOnSite: jest.fn().mockResolvedValue( undefined ),
	setIntentOnSite: jest.fn().mockResolvedValue( undefined ),
};

const submitFor = async (
	slug: string,
	providedDependencies: object,
	navigate: jest.Mock = jest.fn()
) => {
	const navigation = aiSiteBuilderPaidOnly.useStepNavigation( slug as never, navigate );
	await navigation.submit?.( {
		slug,
		providedDependencies,
	} as Parameters< NonNullable< typeof navigation.submit > >[ 0 ] );
	return navigate;
};

const slugsOf = ( steps: unknown ) =>
	( steps as Array< { slug: string } > ).map( ( step ) => step.slug );

describe( 'ai-site-builder paid-only flow', () => {
	const originalLocation = window.location;

	beforeEach( () => {
		jest.clearAllMocks();
		mockIsBusinessPlan.mockReturnValue( false );
		mockIsEcommercePlan.mockReturnValue( false );

		( useQuery as jest.Mock ).mockReturnValue( new URLSearchParams() );
		( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'personal-bundle' } );
		( useAddBlogStickerMutation as jest.Mock ).mockReturnValue( { addBlogSticker: jest.fn() } );
		( useDispatch as jest.Mock ).mockImplementation( ( store: string ) =>
			store === 'SITE_STORE' ? siteActions : onboardActions
		);
		( resolveSelect as jest.Mock ).mockReturnValue( {
			getSite: jest.fn().mockResolvedValue( { URL: 'https://example.wordpress.com' } ),
		} );

		Object.defineProperty( window, 'location', {
			value: { assign: jest.fn(), replace: jest.fn() },
			writable: true,
			configurable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			writable: true,
			configurable: true,
		} );
	} );

	describe( 'initialize', () => {
		it( 'returns domain → plan → checkout step order', () => {
			expect( slugsOf( aiSiteBuilderPaidOnly.initialize() ) ).toEqual( [
				'domains',
				'plans',
				'create-site',
				'processing',
				'error',
			] );
		} );

		it( 'clears stale signup state on a fresh entry', () => {
			( wasSignupCheckoutPageUnloaded as jest.Mock ).mockReturnValue( null );

			aiSiteBuilderPaidOnly.initialize();

			expect( clearStepPersistedState ).toHaveBeenCalledWith( 'ai-site-builder' );
		} );

		it( 'preserves signup state on a checkout re-entry so create-site reuses the site', () => {
			( wasSignupCheckoutPageUnloaded as jest.Mock ).mockReturnValue( 'true' );
			( retrieveSignupDestination as jest.Mock ).mockReturnValue(
				'/setup/transferring-hosted-site'
			);
			( getSignupCompleteFlowName as jest.Mock ).mockReturnValue( 'ai-site-builder' );

			aiSiteBuilderPaidOnly.initialize();

			expect( clearStepPersistedState ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'navigation', () => {
		it( 'stashes the selected domain and advances to the plans step', async () => {
			const navigate = await submitFor( 'domains', {
				siteUrl: 'example.wordpress.com',
				suggestion: { domain_name: 'example.com' },
				domainItem: { product_slug: 'domain_reg' },
				domainCart: [ { product_slug: 'domain_reg' } ],
				signupDomainOrigin: 'custom',
			} );

			expect( onboardActions.setDomainCartItem ).toHaveBeenCalledWith( {
				product_slug: 'domain_reg',
			} );
			expect( navigate ).toHaveBeenCalledWith( 'plans' );
		} );

		it( 'stashes the picked plan and advances to site creation', async () => {
			const navigate = await submitFor( 'plans', {
				cartItems: [ { product_slug: 'premium-bundle' } ],
			} );

			expect( onboardActions.setPlanCartItem ).toHaveBeenCalledWith( {
				product_slug: 'premium-bundle',
			} );
			expect( navigate ).toHaveBeenCalledWith( 'create-site' );
		} );
	} );

	describe( 'processing → checkout', () => {
		const successDeps = {
			processingResult: ProcessingResult.SUCCESS,
			siteCreated: true,
			siteId: 123,
			siteSlug: 'example.wordpress.com',
			goToCheckout: true,
		};

		it( 'sends a Personal plan straight to the Big Sky spec after checkout, with no editor back URL', async () => {
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'personal-bundle' } );

			await submitFor( 'processing', successDeps );

			const checkoutUrl = ( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ];
			expect( checkoutUrl ).toContain( '/checkout/example.wordpress.com' );
			// Cancelling must not drop the user into the editor: no checkoutBackUrl, and an explicit
			// cancel_to back to the site's plans page.
			expect( checkoutUrl ).not.toContain( 'checkoutBackUrl' );
			expect( checkoutUrl ).toContain( 'cancel_to=%2Fplans%2Fexample.wordpress.com' );

			const redirect = decodeURIComponent( checkoutUrl );
			expect( redirect ).toContain( '/wp-admin/site-editor.php' );
			expect( redirect ).toContain( 'ai-step=spec' );
			expect( redirect ).toContain( 'checkout=success' );
			expect( redirect ).not.toContain( '/setup/transferring-hosted-site' );
		} );

		it( 'routes a Business plan through transferring-hosted-site before Big Sky', async () => {
			( useSelect as jest.Mock ).mockReturnValue( { product_slug: 'business-bundle' } );
			mockIsBusinessPlan.mockReturnValue( true );

			await submitFor( 'processing', successDeps );

			const redirect = decodeURIComponent(
				( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ]
			);
			expect( redirect ).toContain( '/setup/transferring-hosted-site' );
			expect( redirect ).toContain( 'siteId=123' );
			// The transfer wait ultimately forwards to the Big Sky spec editor (nested, so the editor
			// URL is encoded as the transfer step's own redirect_to).
			expect( redirect ).toContain( 'site-editor.php' );
			expect( decodeURIComponent( redirect ) ).toContain( 'ai-step=spec' );
		} );

		it( 'falls back to the persisted site id/slug when processing omits them (checkout re-entry)', async () => {
			( getSignupCompleteSiteID as jest.Mock ).mockReturnValue( '123' );
			( getSignupCompleteSlug as jest.Mock ).mockReturnValue( 'example.wordpress.com' );

			await submitFor( 'processing', {
				processingResult: ProcessingResult.SUCCESS,
				siteCreated: true,
				goToCheckout: true,
			} );

			expect( window.location.assign ).toHaveBeenCalledWith(
				expect.stringContaining( '/checkout/example.wordpress.com' )
			);
		} );

		it( 'resumes on the plans page when a checkout re-entry reports NO_ACTION', async () => {
			( getSignupCompleteSlug as jest.Mock ).mockReturnValue( 'example.wordpress.com' );

			await submitFor( 'processing', { processingResult: ProcessingResult.NO_ACTION } );

			expect( window.location.assign ).toHaveBeenCalledWith( '/plans/example.wordpress.com' );
		} );
	} );
} );
