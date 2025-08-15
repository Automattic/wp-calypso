/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { DomainSearch, DomainsMiniCart, DomainsFullCart } from '../../..';
import { buildDomain, buildDomainSearchCart } from '../../../test-helpers/factories';

const SUGGESTIONS = [
	buildDomain( { uuid: '1', domain: 'example', tld: 'com', price: '$10' } ),
	buildDomain( { uuid: '2', domain: 'example', tld: 'com', price: '$10' } ),
];

const Component = () => {
	const [ cartItems, setCartItems ] = useState< string[] >( [ SUGGESTIONS[ 0 ].uuid ] );

	const cart = buildDomainSearchCart( {
		items: cartItems
			.map( ( uuid ) => SUGGESTIONS.find( ( s ) => s.uuid === uuid ) )
			.filter( ( domain ) => !! domain ),
		onAddItem: ( uuid ) => {
			setCartItems( [ ...cartItems, uuid ] );
		},
		onRemoveItem: ( item ) => {
			setCartItems( cartItems.filter( ( i ) => i !== item ) );
		},
		hasItem: ( item ) => cartItems.some( ( i ) => i === item ),
	} );

	return (
		<DomainSearch onContinue={ jest.fn() } cart={ cart }>
			<DomainsMiniCart />
			<DomainsFullCart />
		</DomainSearch>
	);
};

describe( 'DomainSearch', () => {
	it( 'closes the full cart when all items are removed', async () => {
		const user = userEvent.setup();

		render( <Component /> );

		expect( screen.queryByText( 'Cart' ) ).not.toBeVisible();

		await user.click( screen.getByText( 'View cart' ) );

		await waitFor( () => {
			expect( screen.getByText( 'Cart' ) ).toBeVisible();
		} );

		await user.click( screen.getByText( 'Remove' ) );

		await waitFor( () => {
			expect( screen.getByText( 'Cart' ) ).not.toBeVisible();
		} );
	} );
} );
