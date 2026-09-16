/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { translate } from 'i18n-calypso';
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
const NOTICE_PRODUCT =
	/This site already has a Jetpack Search subscription\. Continuing will renew it\./;
const NOTICE_PLAN = /Jetpack Search is already included in this site's plan\./;

const render = ( site ) =>
	renderWithProvider(
		<SearchPurchase
			translate={ translate }
			url={ SITE_URL }
			status=""
			getJetpackSiteByUrl={ () => site }
			renderNotices={ () => null }
			renderFooter={ () => null }
			processJpSite={ () => {} }
			searchSites={ () => [] }
			checkUrl={ () => {} }
			recordTracksEvent={ () => {} }
		/>
	);

describe( 'SearchPurchase', () => {
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

	test( 'warns about renewing when the site already has a paid Search product', () => {
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_free' },
			products: [ { product_slug: 'jetpack_search_monthly', expired: false } ],
		} );

		expect( screen.getByText( NOTICE_PRODUCT ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Manage subscriptions' } ) ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.com'
		);
	} );

	test( 'warns when the site’s plan already includes Search', () => {
		render( {
			URL: SITE_URL,
			plan: { product_slug: 'jetpack_complete' },
			products: [],
		} );

		expect( screen.getByText( NOTICE_PLAN ) ).toBeVisible();
	} );
} );
