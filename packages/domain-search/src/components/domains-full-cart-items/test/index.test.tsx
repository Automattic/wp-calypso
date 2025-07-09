import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainsFullCartItems } from '..';
import { DomainSearchContext } from '../../domain-search';

const defaultContextValue = {
	isFullCartOpen: false,
	closeFullCart: () => {},
	onContinue: () => {},
	query: '',
	setQuery: () => {},
	cart: {
		items: [],
		total: '',
		onAddItem: () => {},
		onRemoveItem: () => {},
	},
	openFullCart: () => {},
};

describe( 'DomainsFullCartItems', () => {
	test( 'renders domains list including name and tld', () => {
		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					cart: {
						items: [
							{ uuid: '1', domain: 'example', tld: 'com', price: '$10' },
							{ uuid: '2', domain: 'test', tld: 'org', price: '$15' },
						],
						total: '$25',
						onAddItem: () => {},
						onRemoveItem: () => {},
					},
				} }
			>
				<DomainsFullCartItems />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByLabelText( 'example.com' ) ).toBeVisible();
		expect( screen.getByLabelText( 'test.org' ) ).toBeVisible();
	} );

	test( 'calls cart.onRemove when clicking on the "Remove" button', async () => {
		const user = userEvent.setup();
		const onRemoveItem = jest.fn();

		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					cart: {
						items: [ { uuid: '1', domain: 'example', tld: 'com', price: '$10' } ],
						total: '$10',
						onAddItem: () => {},
						onRemoveItem,
					},
				} }
			>
				<DomainsFullCartItems />
			</DomainSearchContext.Provider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Remove' } ) );

		expect( onRemoveItem ).toHaveBeenCalledWith( {
			uuid: '1',
			domain: 'example',
			tld: 'com',
			price: '$10',
		} );
	} );

	test( 'renders the original price if included', () => {
		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					cart: {
						items: [
							{
								uuid: '1',
								domain: 'example',
								tld: 'com',
								price: '$10',
								originalPrice: '$20',
							},
						],
						total: '$10',
						onAddItem: () => {},
						onRemoveItem: () => {},
					},
				} }
			>
				<DomainsFullCartItems />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByText( '$20' ) ).toBeVisible();
		expect( screen.getByText( '$10/year' ) ).toBeVisible();
	} );
} );
