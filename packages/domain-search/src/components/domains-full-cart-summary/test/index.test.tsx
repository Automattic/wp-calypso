/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { DomainsFullCartSummary } from '..';
import { DomainSearchContext } from '../../DomainSearch/DomainSearch';

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

describe( 'DomainsFullCartSummary', () => {
	it( 'should display single domain count and total', () => {
		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					cart: {
						...defaultContextValue.cart,
						items: [ { domain: 'test', tld: 'test', price: '$10.00' } ],
						total: '$10.00',
					},
				} }
			>
				<DomainsFullCartSummary />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByText( '1 domain' ) ).toBeInTheDocument();
		expect( screen.getByText( '$10.00' ) ).toBeInTheDocument();
	} );

	it( 'should display multiple domain count and total', () => {
		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					cart: {
						...defaultContextValue.cart,
						items: [
							{ domain: 'test', tld: 'test', price: '$10.00' },
							{ domain: 'test', tld: 'test', price: '$10.00' },
						],
						total: '$20.00',
					},
				} }
			>
				<DomainsFullCartSummary />
			</DomainSearchContext.Provider>
		);

		expect( screen.getByText( '2 domains' ) ).toBeInTheDocument();
		expect( screen.getByText( '$20.00' ) ).toBeInTheDocument();
	} );
} );
