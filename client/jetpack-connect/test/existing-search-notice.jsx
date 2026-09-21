/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import purchases from 'calypso/state/purchases/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ExistingSearchNotice from '../existing-search-notice';

const API = 'https://public-api.wordpress.com:443';
const USER_ID = 7;
const NOTICE_PRODUCT = /This site already has a Jetpack Search subscription\./;
const NOTICE_RENEWAL = /Continuing will renew it\./;

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

const render = ( site, product = 'wpcom_search', siteUrl = 'https://site.example' ) =>
	renderWithProvider(
		<ExistingSearchNotice site={ site } siteUrl={ siteUrl } product={ product } />,
		{ initialState: { currentUser: { id: USER_ID } }, reducers: { purchases } }
	);

describe( 'ExistingSearchNotice with site purchases', () => {
	beforeAll( () => nock.disableNetConnect() );
	afterEach( () => nock.cleanAll() );
	afterAll( () => nock.enableNetConnect() );

	test( 'promises a renewal when the user owns the same WordPress.com Search product', async () => {
		nock( API )
			.get( '/rest/v1.2/sites/11/purchases' )
			.reply( 200, [ purchase( 11 ) ] );
		render( simpleSite( 11 ) );

		expect( await screen.findByText( NOTICE_RENEWAL ) ).toBeVisible();
	} );

	test( 'does not promise a renewal for the other term', async () => {
		nock( API )
			.get( '/rest/v1.2/sites/12/purchases' )
			.reply( 200, [ purchase( 12, { product_slug: 'wpcom_search_monthly' } ) ] );
		render( simpleSite( 12 ) );

		expect( await screen.findByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_RENEWAL ) ).not.toBeInTheDocument();
	} );

	test( 'does not promise a renewal when another user owns the purchase', async () => {
		nock( API )
			.get( '/rest/v1.2/sites/13/purchases' )
			.reply( 200, [ purchase( 13, { user_id: '99' } ) ] );
		render( simpleSite( 13 ) );

		expect( await screen.findByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_RENEWAL ) ).not.toBeInTheDocument();
	} );

	test( 'ignores expired and removed Search purchases', async () => {
		const scope = nock( API )
			.get( '/rest/v1.2/sites/14/purchases' )
			.reply( 200, [
				purchase( 14, { expiry_status: 'expired' } ),
				purchase( 14, { ID: '142', subscription_status: 'inactive' } ),
			] );
		render( simpleSite( 14 ) );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the existing notice when the purchases request fails', async () => {
		const scope = nock( API ).get( '/rest/v1.2/sites/15/purchases' ).reply( 403, {} );
		render( {
			...simpleSite( 15 ),
			plan: { product_slug: 'wp_p2_plus_monthly', expired: false },
		} );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );

		expect(
			screen.getByText( /Jetpack Search is already included in this site's plan\./ )
		).toBeVisible();
		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );

	test( 'requests purchases for Atomic, Flex and Garden sites', async () => {
		nock( API )
			.get( '/rest/v1.2/sites/16/purchases' )
			.reply( 200, [ purchase( 16 ) ] );
		render( {
			...simpleSite( 16 ),
			jetpack: true,
			jetpack_connection: true,
			is_wpcom_atomic: true,
		} );

		expect( await screen.findByText( NOTICE_RENEWAL ) ).toBeVisible();

		const flex = nock( API ).get( '/rest/v1.2/sites/23/purchases' ).reply( 200, [] );
		render( { ...simpleSite( 23 ), jetpack_connection: true, is_wpcom_flex: true } );
		const garden = nock( API ).get( '/rest/v1.2/sites/24/purchases' ).reply( 200, [] );
		render( { ...simpleSite( 24 ), jetpack_connection: true, is_garden: true } );
		await waitFor( () => expect( flex.isDone() && garden.isDone() ).toBe( true ) );
	} );

	test( 'does not request purchases for self-hosted sites or before an address is entered', async () => {
		const scope = nock( API )
			.get( /\/purchases/ )
			.reply( 200, [] );
		render( { ...simpleSite( 19 ), jetpack: true, jetpack_connection: true } );
		render( { ...simpleSite( 21 ), jetpack_connection: true } );
		render( { ...simpleSite( 22 ), jetpack_connection: undefined } );
		render( simpleSite( 20 ), 'wpcom_search', '' );
		await act( () => new Promise( ( resolve ) => setTimeout( resolve, 50 ) ) );

		expect( scope.isDone() ).toBe( false );
	} );

	test( 'does not show a previous site’s purchase after switching sites', async () => {
		nock( API )
			.get( '/rest/v1.2/sites/17/purchases' )
			.delay( 100 )
			.reply( 200, [ purchase( 17 ) ] );
		const second = nock( API ).get( '/rest/v1.2/sites/18/purchases' ).reply( 200, [] );
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
