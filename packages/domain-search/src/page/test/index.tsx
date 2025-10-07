import { render, screen } from '@testing-library/react';
import { buildCart } from '../../test/factories/cart';
import { mockGetSuggestions } from '../../test/mocks/suggestions';
import { DomainSearch } from '../index';

describe( 'DomainSearch', () => {
	it( 'renders the initial state when no query is provided', () => {
		render(
			<DomainSearch
				cart={ buildCart() }
				slots={ { BeforeResults: () => <div>Before Results</div> } }
			/>
		);

		expect( screen.queryByText( 'Before Results' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the results page when a query is provided', () => {
		mockGetSuggestions( [] );

		render(
			<DomainSearch
				cart={ buildCart() }
				query="test"
				slots={ { BeforeResults: () => <div>Before Results</div> } }
			/>
		);

		expect( screen.getByText( 'Before Results' ) ).toBeInTheDocument();
	} );

	it( 'fires the onPageView event when the component mounts', () => {
		const onPageView = jest.fn();

		render( <DomainSearch cart={ buildCart() } events={ { onPageView } } /> );

		expect( onPageView ).toHaveBeenCalled();
	} );
} );
