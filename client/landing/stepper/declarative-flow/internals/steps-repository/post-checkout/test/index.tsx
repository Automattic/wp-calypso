/**
 * @jest-environment jsdom
 */
import { FEATURE_BIG_SKY } from '@automattic/calypso-products';
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { waitForPluginsActive } from 'calypso/landing/stepper/utils/wait-for-plugins-active';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { mockStepProps, renderStep } from '../../test/helpers';
import PostCheckoutOnboarding from '../post-checkout-onboarding';

const mockGetSite = jest.fn();
const mockSetPendingAction = jest.fn();
const mockSetIntentOnSite = jest.fn();
const mockSetGoalsOnSite = jest.fn();
const mockOnboardState = { intent: '', goals: [] as string[] };
const mockSiteTransferStatus = { isTransferring: false };

// A spread would read every export while these modules are still loading (both are required back
// through their own dependencies), so override the exports lazily.
const withOverrides = ( actual: Record< string, unknown >, overrides: Record< string, unknown > ) =>
	new Proxy( actual, {
		get: ( target, key: string ) => ( key in overrides ? overrides[ key ] : target[ key ] ),
	} );

jest.mock( '@automattic/api-queries', () =>
	withOverrides( jest.requireActual( '@automattic/api-queries' ), {
		siteBySlugQuery: ( siteSlug: string ) => ( {
			queryKey: [ 'site-by-slug', siteSlug ],
			queryFn: () => mockGetSite(),
		} ),
	} )
);

jest.mock( '@wordpress/data', () =>
	withOverrides( jest.requireActual( '@wordpress/data' ), {
		// Mirrors the real onboard store's empty state; anything else this tree selects is unset.
		useSelect: ( selector: ( select: () => unknown ) => unknown ) =>
			selector(
				() =>
					new Proxy(
						{
							getIntent: () => mockOnboardState.intent,
							getGoals: () => mockOnboardState.goals,
						} as Record< string, () => unknown >,
						{ get: ( target, key: string ) => target[ key ] ?? ( () => undefined ) }
					)
			),
		useDispatch: () => ( {
			setPendingAction: mockSetPendingAction,
			setIntentOnSite: mockSetIntentOnSite,
			setGoalsOnSite: mockSetGoalsOnSite,
		} ),
	} )
);

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'automattic/onboard',
	SITE_STORE: 'automattic/site',
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-slug-param', () => ( {
	useSiteSlugParam: () => 'example.wordpress.com',
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-marketplace-theme-products', () => ( {
	useMarketplaceThemeProducts: () => ( { isLoading: false, isError: false } ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-transfer-status-query', () => ( {
	useSiteTransferStatusQuery: () => ( {
		data: mockSiteTransferStatus,
		isLoading: false,
		isError: false,
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-wait-for-atomic', () => ( {
	useWaitForAtomic: () => ( {
		waitForTransfer: async () => {},
		waitForFeature: async () => {},
		waitForLatestSiteData: async () => {},
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/utils/wait-for-plugins-active', () => ( {
	waitForPluginsActive: jest.fn( async () => {} ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const siteWithPlan = ( product_slug: string, active: string[] = [] ) => ( {
	ID: 123,
	slug: 'example.wordpress.com',
	plan: { product_slug, features: { active } },
} );

describe( 'PostCheckoutOnboarding', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockOnboardState.intent = '';
		mockOnboardState.goals = [];
		mockSiteTransferStatus.isTransferring = false;
	} );

	const renderWithFreshSite = ( site: unknown, flow = 'onboarding' ) => {
		mockGetSite.mockResolvedValue( site );
		const props = mockStepProps( { flow, stepName: 'post-checkout-onboarding' } );
		renderStep( <PostCheckoutOnboarding { ...props } />, {
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		} );
		return props;
	};

	it( 'decides on the chooser from a fresh fetch rather than a cached pre-purchase site', async () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		queryClient.setQueryData(
			[ 'site-by-slug', 'example.wordpress.com' ],
			siteWithPlan( 'free_plan' )
		);

		let resolveSite: ( site: unknown ) => void = () => {};
		mockGetSite.mockReturnValue( new Promise( ( resolve ) => ( resolveSite = resolve ) ) );

		const props = mockStepProps( { flow: 'onboarding', stepName: 'post-checkout-onboarding' } );
		renderStep( <PostCheckoutOnboarding { ...props } />, { queryClient } );

		await waitFor( () => expect( mockGetSite ).toHaveBeenCalled() );
		expect( props.navigation.submit ).not.toHaveBeenCalled();

		resolveSite( siteWithPlan( 'business-bundle', [ FEATURE_BIG_SKY ] ) );

		await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );

		// Deciding once, from the fresh site, is the contract: a decision from the cached site
		// would also be followed by one from the fresh site.
		expect( props.navigation.submit ).toHaveBeenCalledTimes( 1 );
		expect( mockSetPendingAction ).toHaveBeenCalledTimes( 1 );

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
		await expect( pendingAction() ).resolves.toMatchObject( { postCheckoutBigSky: true } );
	} );

	it.each( [ 'personal-bundle', 'value_bundle', 'business-bundle', 'ecommerce-bundle' ] )(
		'offers the chooser after a %s checkout',
		async ( planSlug ) => {
			const props = renderWithFreshSite( siteWithPlan( planSlug, [ FEATURE_BIG_SKY ] ) );

			await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );

			const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
			await expect( pendingAction() ).resolves.toMatchObject( { postCheckoutBigSky: true } );
		}
	);

	it.each( [
		[ 'a free site', siteWithPlan( 'free_plan', [ FEATURE_BIG_SKY ] ) ],
		[ 'a plan without Big Sky', siteWithPlan( 'ecommerce-bundle' ) ],
	] )( 'skips the chooser for %s', async ( _label, site ) => {
		const props = renderWithFreshSite( site );

		await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
		await expect( pendingAction() ).resolves.not.toHaveProperty( 'postCheckoutBigSky' );
	} );

	it( 'waits for WooCommerce before a Commerce site reaches the chooser', async () => {
		const props = renderWithFreshSite( siteWithPlan( 'ecommerce-bundle', [ FEATURE_BIG_SKY ] ) );

		await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );
		await mockSetPendingAction.mock.calls[ 0 ][ 0 ]();

		expect( waitForPluginsActive ).toHaveBeenCalledWith( 123, [ 'woocommerce' ] );
	} );

	it( 'skips the chooser when WooCommerce is still not active on a Commerce site', async () => {
		( waitForPluginsActive as jest.Mock ).mockRejectedValueOnce(
			new Error( 'plugin check timeout exceeded 300s' )
		);
		const props = renderWithFreshSite( siteWithPlan( 'ecommerce-bundle', [ FEATURE_BIG_SKY ] ) );

		await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );

		const pendingAction = mockSetPendingAction.mock.calls[ 0 ][ 0 ];
		const dependencies = await pendingAction();
		expect( dependencies ).toMatchObject( { siteSlug: 'example.wordpress.com' } );
		expect( dependencies ).not.toHaveProperty( 'postCheckoutBigSky' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_onboarding_post_checkout_setup_error',
			{ flow: 'onboarding', error_woocommerce_timeout: true }
		);
	} );

	it.each( [
		[ 'a Business site', siteWithPlan( 'business-bundle', [ FEATURE_BIG_SKY ] ), 'onboarding' ],
		[ 'a Commerce site that skips the chooser', siteWithPlan( 'ecommerce-bundle' ), 'onboarding' ],
	] )( 'does not wait for WooCommerce on %s', async ( _label, site, flow ) => {
		const props = renderWithFreshSite( site, flow );

		await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );
		await mockSetPendingAction.mock.calls[ 0 ][ 0 ]();

		expect( waitForPluginsActive ).not.toHaveBeenCalled();
	} );

	describe( 'while the site is moving to Atomic', () => {
		beforeEach( () => {
			mockSiteTransferStatus.isTransferring = true;
		} );

		it( 'leaves the intent and goals of a site handed over with an empty store alone', async () => {
			const props = renderWithFreshSite( siteWithPlan( 'business-bundle' ) );
			await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );

			await mockSetPendingAction.mock.calls[ 0 ][ 0 ]();

			expect( mockSetIntentOnSite ).not.toHaveBeenCalled();
			expect( mockSetGoalsOnSite ).not.toHaveBeenCalled();
		} );

		it( 'applies the intent and goals picked earlier in the run', async () => {
			mockOnboardState.intent = 'build';
			mockOnboardState.goals = [ 'write' ];
			const props = renderWithFreshSite( siteWithPlan( 'business-bundle' ) );
			await waitFor( () => expect( props.navigation.submit ).toHaveBeenCalled() );

			await mockSetPendingAction.mock.calls[ 0 ][ 0 ]();

			expect( mockSetIntentOnSite ).toHaveBeenCalledWith( 'example.wordpress.com', 'build' );
			expect( mockSetGoalsOnSite ).toHaveBeenCalledWith( 'example.wordpress.com', [ 'write' ] );
		} );
	} );
} );
