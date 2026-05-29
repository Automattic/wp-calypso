/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import ManageSiteRedirect from '../manage-site-redirect';

const siteId = 42;
const currentRedirect = 'example.com';

function mockUserPurchases( purchases: object[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, purchases );
}

function siteRedirectPurchase( overrides: Record< string, unknown > = {} ) {
	return {
		ID: '9001',
		blog_id: String( siteId ),
		product_slug: 'offsite_redirect',
		product_name: 'Site Redirect',
		is_cancelable: true,
		is_removable: false,
		ownership_id: '1',
		product_id: '1',
		user_id: '1',
		is_domain: false,
		is_domain_registration: false,
		...overrides,
	};
}

function renderManageSiteRedirect() {
	return render( <ManageSiteRedirect siteId={ siteId } currentRedirect={ currentRedirect } /> );
}

describe( '<ManageSiteRedirect>', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'shows Delete redirect next to Save when the redirect purchase is cancelable', async () => {
		mockUserPurchases( [ siteRedirectPurchase() ] );
		renderManageSiteRedirect();

		expect( await screen.findByRole( 'button', { name: 'Save' } ) ).toBeVisible();
		const deleteLink = await screen.findByRole( 'link', { name: 'Delete redirect' } );
		expect( deleteLink ).toBeVisible();
		expect( deleteLink ).toHaveAttribute( 'href', expect.stringContaining( 'intent=remove' ) );
	} );

	test( 'shows Delete redirect when the redirect purchase is removable but not cancelable', async () => {
		mockUserPurchases( [ siteRedirectPurchase( { is_cancelable: false, is_removable: true } ) ] );
		renderManageSiteRedirect();

		expect( await screen.findByRole( 'link', { name: 'Delete redirect' } ) ).toBeVisible();
	} );

	test( 'hides Delete redirect when the redirect purchase cannot be cancelled or removed', async () => {
		mockUserPurchases( [ siteRedirectPurchase( { is_cancelable: false, is_removable: false } ) ] );
		renderManageSiteRedirect();

		await screen.findByRole( 'button', { name: 'Save' } );

		await waitFor( () => {
			expect( screen.queryByRole( 'link', { name: 'Delete redirect' } ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'hides Delete redirect when there is no offsite redirect purchase for the site', async () => {
		mockUserPurchases( [
			siteRedirectPurchase( { blog_id: '99', product_slug: 'offsite_redirect' } ),
		] );
		renderManageSiteRedirect();

		await screen.findByRole( 'button', { name: 'Save' } );

		await waitFor( () => {
			expect( screen.queryByRole( 'link', { name: 'Delete redirect' } ) ).not.toBeInTheDocument();
		} );
	} );
} );
