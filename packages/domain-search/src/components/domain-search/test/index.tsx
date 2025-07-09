/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SelectedDomain } from '..';
import { DomainSearch, DomainsMiniCart, DomainsFullCart } from '../../..';

const Component = () => {
	const [ items, setItems ] = useState< SelectedDomain[] >( [
		{ uuid: '1', domain: 'test.com', tld: 'com', price: '10' },
	] );

	const cart = {
		items,
		total: '10',
		onAddItem: ( item: SelectedDomain ) => setItems( [ ...items, item ] ),
		onRemoveItem: ( item: SelectedDomain ) =>
			setItems( items.filter( ( i ) => i.uuid !== item.uuid ) ),
	};

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
