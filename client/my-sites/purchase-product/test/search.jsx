/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import purchases from 'calypso/state/purchases/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SearchPurchase } from '../search';

jest.mock(
	'calypso/jetpack-connect/main-wrapper',
	() =>
		( { children } ) =>
			children
);
jest.mock( 'calypso/jetpack-connect/main-header', () => () => null );

const SITE_URL = 'https://example.com';
const NOTICE_PRODUCT = /This site already has a Jetpack Search subscription\./;
const NOTICE_RENEWAL = /Continuing will renew it\./;
const NOTICE_PLAN = /Jetpack Search is already included in this site's plan\./;

const render = ( site, jetpackSite = site, url = SITE_URL ) =>
	renderWithProvider(
		<SearchPurchase
			translate={ translate }
			url={ url }
			status=""
			getJetpackSiteByUrl={ () => jetpackSite }
			getSiteByUrl={ () => site }
			renderNotices={ () => null }
			renderFooter={ () => null }
			processJpSite={ () => {} }
			searchSites={ () => [] }
			checkUrl={ () => {} }
			recordTracksEvent={ () => {} }
		/>,
		{ reducers: { purchases } }
	);

describe( 'SearchPurchase', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	test( 'does not warn when the URL is not one of the user’s sites', () => {
		render( null );

		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
		expect( screen.queryByText( NOTICE_PLAN ) ).not.toBeInTheDocument();
	} );

	test( 'does not warn when the site has no Search product', () => {
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_free' },
			products: [ { product_slug: 'jetpack_backup_t1_yearly', expired: false } ],
		} );

		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );

	test( 'does not warn for the free Search product or an expired one', () => {
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_free' },
			products: [
				{ product_slug: 'jetpack_search_free', expired: false },
				{ product_slug: 'jetpack_search', expired: true },
			],
		} );

		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );

	test( 'warns about renewing when the user owns the Search product being purchased', () => {
		window.history.replaceState( null, '', '/purchase-product/jetpack_search' );
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_free' },
			products: [ { product_slug: 'jetpack_search', expired: false, user_is_owner: true } ],
		} );

		expect( screen.getByText( NOTICE_RENEWAL ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Manage subscriptions' } ) ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.com'
		);
	} );

	test( 'does not warn before a site address is entered', () => {
		window.history.replaceState( null, '', '/purchase-product/jetpack_search' );
		render(
			{
				URL: SITE_URL,
				plan: { product_slug: 'jetpack_free' },
				products: [ { product_slug: 'jetpack_search', expired: false, user_is_owner: true } ],
			},
			null,
			''
		);

		expect( screen.queryByText( NOTICE_PRODUCT ) ).not.toBeInTheDocument();
	} );

	test( 'warns on a Simple site whose P2+ plan includes Search', () => {
		window.history.replaceState( null, '', '/purchase-product/wpcom_search' );
		render(
			{
				URL: SITE_URL,
				jetpack: false,
				plan: { product_slug: 'wp_p2_plus_monthly' },
				products: [],
			},
			null
		);

		expect( screen.getByText( NOTICE_PLAN ) ).toBeVisible();
	} );

	test( 'does not promise a renewal when the owned Search term differs from the route', () => {
		window.history.replaceState( null, '', '/purchase-product/jetpack_search' );
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_free' },
			products: [ { product_slug: 'jetpack_search_monthly', expired: false, user_is_owner: true } ],
		} );

		expect( screen.getByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_RENEWAL ) ).not.toBeInTheDocument();
	} );

	test( 'does not promise a renewal when the user does not own the Search subscription', () => {
		window.history.replaceState( null, '', '/purchase-product/jetpack_search' );
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_free' },
			products: [ { product_slug: 'jetpack_search', expired: false, user_is_owner: false } ],
		} );

		expect( screen.getByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.queryByText( NOTICE_RENEWAL ) ).not.toBeInTheDocument();
	} );

	test( 'warns when the site’s plan already includes Search', () => {
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_complete' },
			products: [],
		} );

		expect( screen.getByText( NOTICE_PLAN ) ).toBeVisible();
	} );

	test( 'does not warn when the site’s plan includes Search but has expired', () => {
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_complete', expired: true },
			products: [],
		} );

		expect( screen.queryByText( NOTICE_PLAN ) ).not.toBeInTheDocument();
	} );
} );
