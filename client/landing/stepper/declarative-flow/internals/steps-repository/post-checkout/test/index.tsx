/**
 * @jest-environment jsdom
 */
import { FEATURE_BIG_SKY } from '@automattic/calypso-products';
import { QueryClient } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { mockStepProps, renderStep } from '../../test/helpers';
import PostCheckoutOnboarding from '../post-checkout-onboarding';

const mockGetSite = jest.fn();
const mockSetPendingAction = jest.fn();

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
		useSelect: () => undefined,
		useDispatch: () => ( { setPendingAction: mockSetPendingAction } ),
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
	useSiteTransferStatusQuery: () => ( { data: undefined, isLoading: false, isError: false } ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-wait-for-atomic', () => ( {
	useWaitForAtomic: () => ( {} ),
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
	} );

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

		const pendingAction = mockSetPendingAction.mock.lastCall[ 0 ];
		await expect( pendingAction() ).resolves.toMatchObject( { postCheckoutBigSky: true } );
	} );
} );
