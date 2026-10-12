/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ExistingSearchNotice from '../existing-search-notice';

const API = 'https://public-api.wordpress.com:443';
const USER_ID = 7;
const NOTICE_PRODUCT = /This site already has a Jetpack Search subscription\./;
const NOTICE_RENEWAL = /Continuing will renew it\./;
const NOTICE_PLAN = /Jetpack Search is already included in this site's plan\./;
const NOTICE_EXPIRED =
	/This site's Jetpack Search subscription has expired\. Continuing will renew it\./;
const NOTICE_EXPIRED_PRODUCT =
	/This site already has a Jetpack Search subscription, but it has expired\./;
const NOTICE_EXPIRED_PLAN =
	/Jetpack Search is included in this site's plan, but the plan has expired\./;

const simpleSite = ( ID ) => ( {
	ID,
	URL: `https://site-${ ID }.example`,
	jetpack: false,
	jetpack_connection: false,
	plan: { product_slug: 'personal-bundle', expired: false },
	products: [],
} );

const purchase = ( blogId, overrides = {} ) => ( {
	ID: `${ blogId }1`,
	blog_id: String( blogId ),
	product_slug: 'wpcom_search',
	user_id: String( USER_ID ),
	subscription_status: 'active',
	expiry_status: 'auto-renewing',
	...overrides,
} );

const sitePurchases = ( blogId ) =>
	nock( API )
		.get( '/rest/v1.2/upgrades' )
		.query( { site: String( blogId ) } );

const render = ( site, product = 'wpcom_search', siteUrl = 'https://site.example' ) =>
	renderWithProvider(
		<ExistingSearchNotice site={ site } siteUrl={ siteUrl } product={ product } />,
		{
			initialState: { currentUser: { id: USER_ID } },
			queryClient: new QueryClient( { defaultOptions: { queries: { retry: false } } } ),
		}
	);

describe( 'ExistingSearchNotice with site purchases', () => {
	beforeAll( () => nock.disableNetConnect() );
	afterEach( () => nock.cleanAll() );
	afterAll( () => nock.enableNetConnect() );

	test( 'promises a renewal when the user owns the same WordPress.com Search product', async () => {
		sitePurchases( 11 ).reply( 200, [ purchase( 11 ) ] );
		render( simpleSite( 11 ) );

		expect( await screen.findByText( NOTICE_RENEWAL ) ).toBeVisible();
	} );

	test( 'does not promise a renewal for the other term', async () => {
		sitePurchases( 12 ).reply( 200, [ purchase( 12, { product_slug: 'wpcom_search_monthly' } ) ] );
		render( simpleSite( 12 ) );

		expect( await screen.findByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_RENEWAL ) ).not.toBeInTheDocument();
	} );

	test( 'does not promise a renewal when another user owns the purchase', async () => {
		sitePurchases( 13 ).reply( 200, [ purchase( 13, { user_id: '99' } ) ] );
		render( simpleSite( 13 ) );

		expect( await screen.findByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_RENEWAL ) ).not.toBeInTheDocument();
	} );

	test( 'promises a renewal for a Search purchase in its grace period', async () => {
		sitePurchases( 14 ).reply( 200, [ purchase( 14, { expiry_status: 'expired' } ) ] );
		render( simpleSite( 14 ) );

		expect( await screen.findByText( NOTICE_EXPIRED ) ).toBeVisible();
	} );

	test( 'ignores removed Search purchases', async () => {
		const scope = sitePurchases( 25 ).reply( 200, [
			purchase( 25, { subscription_status: 'inactive' } ),
		] );
		render( simpleSite( 25 ) );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );

	test( 'names the expiry when the expired purchase belongs to another user', async () => {
		sitePurchases( 28 ).reply( 200, [
			purchase( 28, { user_id: '99', expiry_status: 'expired' } ),
		] );
		render( simpleSite( 28 ) );

		expect( await screen.findByText( NOTICE_EXPIRED_PRODUCT ) ).toBeVisible();
	} );

	test( 'promises a renewal for an expired Search product on a self-hosted site', async () => {
		render(
			{
				...simpleSite( 26 ),
				jetpack: true,
				jetpack_connection: true,
				products: [ { product_slug: 'jetpack_search', user_is_owner: true, expired: true } ],
			},
			'jetpack_search'
		);

		expect( await screen.findByText( NOTICE_EXPIRED ) ).toBeVisible();
	} );

	// Two Search subscriptions can't combine, so renewing the lapsed one would double-charge.
	test( 'prefers an active Search product over an expired one the user owns', async () => {
		render(
			{
				...simpleSite( 29 ),
				jetpack: true,
				jetpack_connection: true,
				products: [
					{ product_slug: 'jetpack_search', user_is_owner: true, expired: true },
					{ product_slug: 'jetpack_search_monthly', user_is_owner: true, expired: false },
				],
			},
			'jetpack_search'
		);

		expect( await screen.findByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_EXPIRED ) ).not.toBeInTheDocument();
	} );

	// A plan's Search and a standalone subscription stack, so the renewal may be deliberate.
	test( 'still promises a renewal when the plan also includes Search', async () => {
		render(
			{
				...simpleSite( 30 ),
				jetpack: true,
				jetpack_connection: true,
				plan: { product_slug: 'jetpack_complete', expired: false },
				products: [ { product_slug: 'jetpack_search', user_is_owner: true, expired: true } ],
			},
			'jetpack_search'
		);

		expect( await screen.findByText( NOTICE_EXPIRED ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_PLAN ) ).not.toBeInTheDocument();
	} );

	test( 'points at the plan when the plan including Search has expired', async () => {
		const scope = sitePurchases( 27 ).reply( 200, [] );
		render( {
			...simpleSite( 27 ),
			plan: { product_slug: 'wp_p2_plus_monthly', expired: true },
		} );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		expect( screen.getByText( NOTICE_EXPIRED_PLAN ) ).toBeVisible();
	} );

	test( 'keeps the existing notice when the purchases request fails', async () => {
		const scope = sitePurchases( 15 ).reply( 403, {} );
		render( {
			...simpleSite( 15 ),
			plan: { product_slug: 'wp_p2_plus_monthly', expired: false },
		} );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		expect( screen.getByText( NOTICE_PLAN ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );

	test( 'requests purchases for Atomic, Flex and Garden sites', async () => {
		sitePurchases( 16 ).reply( 200, [ purchase( 16 ) ] );
		render( {
			...simpleSite( 16 ),
			jetpack: true,
			jetpack_connection: true,
			is_wpcom_atomic: true,
		} );

		expect( await screen.findByText( NOTICE_RENEWAL ) ).toBeVisible();

		const flex = sitePurchases( 23 ).reply( 200, [] );
		render( { ...simpleSite( 23 ), jetpack_connection: true, is_wpcom_flex: true } );
		const garden = sitePurchases( 24 ).reply( 200, [] );
		render( { ...simpleSite( 24 ), jetpack_connection: true, is_garden: true } );
		await waitFor( () => expect( flex.isDone() && garden.isDone() ).toBe( true ) );
	} );

	test( 'does not request purchases for self-hosted sites or before an address is entered', async () => {
		const scope = nock( API ).get( '/rest/v1.2/upgrades' ).query( true ).reply( 200, [] );
		render( { ...simpleSite( 19 ), jetpack: true, jetpack_connection: true } );
		render( { ...simpleSite( 21 ), jetpack_connection: true } );
		render( { ...simpleSite( 22 ), jetpack_connection: undefined } );
		render( simpleSite( 20 ), 'wpcom_search', '' );
		await act( () => new Promise( ( resolve ) => setTimeout( resolve, 50 ) ) );

		expect( scope.isDone() ).toBe( false );
	} );

	test( 'does not show a previous site’s purchase after switching sites', async () => {
		sitePurchases( 17 )
			.delay( 100 )
			.reply( 200, [ purchase( 17 ) ] );
		const second = sitePurchases( 18 ).reply( 200, [] );
		const { rerender } = render( simpleSite( 17 ) );
		rerender(
			<ExistingSearchNotice
				site={ simpleSite( 18 ) }
				siteUrl="https://site.example"
				product="wpcom_search"
			/>
		);
		await waitFor( () => expect( second.isDone() ).toBe( true ) );

		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );
} );
