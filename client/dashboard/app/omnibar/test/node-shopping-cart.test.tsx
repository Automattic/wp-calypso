/**
 * @jest-environment jsdom
 */

import { fetchShoppingCart, updateShoppingCart } from '@automattic/api-core';
import { omnibarSiteIdQuery } from '@automattic/api-queries';
import {
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
} from '@automattic/shopping-cart';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import OmnibarContainer from '../omnibar';

const site = {
	ID: 1,
	name: 'Test Site',
	site_migration: {},
};

const cartWithProduct = {
	...getEmptyResponseCart(),
	blog_id: site.ID,
	cart_key: site.ID,
	products: [
		{
			...getEmptyResponseCartProduct(),
			product_name: 'WordPress.com Personal',
			product_slug: 'personal-bundle',
		},
	],
};

const myAccountNode = {
	id: 'my-account',
	title:
		"Howdy, <span class=\"display-name\">Test User</span><img alt='Test User&#039;s avatar' src='https://1.gravatar.com/avatar/test' class='avatar avatar-28' />",
	parent: 'top-secondary',
	href: 'https://test-site.wordpress.com/wp-admin/profile.php',
	group: false,
	meta: {
		menu_title: 'Howdy, Test User',
	},
};

function mockCart( cart: object ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/me/shopping-cart/${ site.ID }` )
		.reply( 200, cart );
}

function renderOmnibar() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, site.ID );

	// A fresh client per test, since a client caches the carts it has loaded.
	const cartManagerClient = createShoppingCartManagerClient( {
		getCart: fetchShoppingCart,
		setCart: updateShoppingCart,
	} );

	return {
		...render( <OmnibarContainer cartManagerClient={ cartManagerClient } />, { queryClient } ),
		cartManagerClient,
	};
}

describe( '<Omnibar> shopping cart node', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/dashboard/admin-bar' )
			.query( true )
			.reply( 200, { nodes: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/admin-bar` )
			.query( true )
			.reply( 200, { nodes: [ myAccountNode ] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.ID }` )
			.query( true )
			.reply( 200, site );
	} );

	afterEach( () => nock.cleanAll() );

	test( 'shows the node', async () => {
		mockCart( cartWithProduct );

		const { recordTracksEvent } = renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		expect(
			await within( toolbar ).findByRole( 'button', { name: 'My shopping cart' } )
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_masterbar_cart_shown' );
	} );

	test( 'hides the node when the cart is empty', async () => {
		mockCart( getEmptyResponseCart() );

		const { cartManagerClient } = renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await within( toolbar ).findByRole( 'button', { name: 'Howdy, Test User' } );
		await waitFor( () =>
			expect( cartManagerClient.forCartKey( site.ID ).getState().isLoading ).toBe( false )
		);
		expect(
			within( toolbar ).queryByRole( 'button', { name: 'My shopping cart' } )
		).not.toBeInTheDocument();
	} );

	test( 'opens the cart when clicking the node', async () => {
		const user = userEvent.setup();
		mockCart( cartWithProduct );

		const { recordTracksEvent } = renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click(
			await within( toolbar ).findByRole( 'button', { name: 'My shopping cart' } )
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_masterbar_cart_open' );
		const productName = await screen.findByText( 'WordPress.com Personal' );
		await waitFor( () => expect( productName ).toBeVisible() );
	} );
} );
