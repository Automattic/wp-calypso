import { queryClient } from '@automattic/api-queries';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { buildCart } from '../../test-helpers/factories/cart';
import { mockGetSuggestionsQuery } from '../../test-helpers/queries/suggestions';
import { DomainSearch } from '../index';

describe( 'DomainSearch', () => {
	afterEach( () => {
		queryClient.clear();
	} );

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
		mockGetSuggestionsQuery( { params: { query: 'test' }, suggestions: [] } );

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

	describe( 'mount search', () => {
		it( 'reports a prefilled search when mounting with an uncached query', () => {
			const onSearchStart = jest.fn();

			mockGetSuggestionsQuery( { params: { query: 'coffee' }, suggestions: [] } );

			render( <DomainSearch cart={ buildCart() } query="coffee" events={ { onSearchStart } } /> );

			expect( onSearchStart ).toHaveBeenCalledTimes( 1 );
			expect( onSearchStart ).toHaveBeenCalledWith( 'coffee', 'prefilled' );
		} );

		it( 'reports a cached search when the results are already in the client-side cache', async () => {
			const onSearchStart = jest.fn();
			const onSuggestionsReceive = jest.fn();

			mockGetSuggestionsQuery( { params: { query: 'coffee' }, suggestions: [] } );

			const { unmount } = render(
				<DomainSearch
					cart={ buildCart() }
					query="coffee"
					events={ { onSearchStart, onSuggestionsReceive } }
				/>
			);

			await waitFor( () => expect( onSuggestionsReceive ).toHaveBeenCalled() );

			unmount();
			onSearchStart.mockClear();

			render( <DomainSearch cart={ buildCart() } query="coffee" events={ { onSearchStart } } /> );

			expect( onSearchStart ).toHaveBeenCalledTimes( 1 );
			expect( onSearchStart ).toHaveBeenCalledWith( 'coffee', 'cached' );
		} );

		it( 'does not report a search when mounting without a query', () => {
			const onSearchStart = jest.fn();

			render( <DomainSearch cart={ buildCart() } events={ { onSearchStart } } /> );

			expect( onSearchStart ).not.toHaveBeenCalled();
		} );

		it( 'only reports the submit when the first search starts from the empty state', async () => {
			const user = userEvent.setup();
			const onSearchStart = jest.fn();

			mockGetSuggestionsQuery( { params: { query: 'coffee' }, suggestions: [] } );

			const ControlledDomainSearch = () => {
				const [ query, setQuery ] = useState< string >();

				return (
					<DomainSearch
						cart={ buildCart() }
						query={ query }
						events={ { onQueryChange: setQuery, onSearchStart } }
					/>
				);
			};

			render( <ControlledDomainSearch /> );

			await user.type( screen.getByRole( 'searchbox' ), 'coffee' );
			await user.click( screen.getByRole( 'button', { name: 'Search domains' } ) );

			expect( onSearchStart ).toHaveBeenCalledTimes( 1 );
			expect( onSearchStart ).toHaveBeenCalledWith( 'coffee', 'submit' );
		} );

		it( 'does not report a mount search again when the query prop changes', () => {
			const onSearchStart = jest.fn();

			mockGetSuggestionsQuery( { params: { query: 'coffee' }, suggestions: [] } );
			mockGetSuggestionsQuery( { params: { query: 'tea' }, suggestions: [] } );

			const { rerender } = render(
				<DomainSearch cart={ buildCart() } query="coffee" events={ { onSearchStart } } />
			);

			rerender( <DomainSearch cart={ buildCart() } query="tea" events={ { onSearchStart } } /> );

			expect( onSearchStart ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
