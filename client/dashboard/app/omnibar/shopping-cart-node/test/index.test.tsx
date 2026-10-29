/**
 * @jest-environment jsdom
 */

import { fetchShoppingCart, updateShoppingCart } from '@automattic/api-core';
import { Omnibar } from '@automattic/omnibar';
import {
	ShoppingCartProvider,
	createShoppingCartManagerClient,
	getEmptyResponseCart,
	getEmptyResponseCartProduct,
} from '@automattic/shopping-cart';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { useShoppingCartNode } from '../index';
import type { Site } from '@automattic/api-core';
import type { ShoppingCartManagerClient } from '@automattic/shopping-cart';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	name: 'Test Site',
} as Site;

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

function mockCart( cart: object ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/me/shopping-cart/${ site.ID }` )
		.reply( 200, cart );
}

function ShoppingCartNodeOmnibar() {
	const { node, panel } = useShoppingCartNode( { site } );
	return (
		<>
			<Omnibar nodes={ { userNodes: node ? [ node ] : [] } } />
			{ panel }
		</>
	);
}

function renderNode() {
	// A fresh client per test, since a client caches the carts it has loaded.
	const cartManagerClient: ShoppingCartManagerClient = createShoppingCartManagerClient( {
		getCart: fetchShoppingCart,
		setCart: updateShoppingCart,
	} );

	return {
		...render(
			<ShoppingCartProvider managerClient={ cartManagerClient }>
				<ShoppingCartNodeOmnibar />
			</ShoppingCartProvider>
		),
		cartManagerClient,
	};
}

describe( '<Omnibar> shopping cart node', () => {
	test( 'shows the node', async () => {
		mockCart( cartWithProduct );

		const { recordTracksEvent } = renderNode();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		expect(
			await within( toolbar ).findByRole( 'button', { name: 'My shopping cart' } )
		).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_masterbar_cart_shown' );
	} );

	test( 'hides the node when the cart is empty', async () => {
		mockCart( getEmptyResponseCart() );

		const { cartManagerClient } = renderNode();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
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

		const { recordTracksEvent } = renderNode();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click(
			await within( toolbar ).findByRole( 'button', { name: 'My shopping cart' } )
		);

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_masterbar_cart_open' );
		const productName = await screen.findByText( 'WordPress.com Personal' );
		await waitFor( () => expect( productName ).toBeVisible() );
	} );
} );
