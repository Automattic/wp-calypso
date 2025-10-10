import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResults } from '..';
import { buildSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { mockGetAvailableTldsQuery } from '../../../test-helpers/queries/tlds';
import { TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';
import { Filter } from '../../search-bar/filter';

describe( 'SearchResults', () => {
	it( 'renders the search results', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test' },
			suggestions: [
				buildSuggestion( { domain_name: 'test-regular.com' } ),
				buildSuggestion( { domain_name: 'test-regular.net' } ),
			],
		} );

		render(
			<TestDomainSearchWithSuggestions query="test">
				<SearchResults suggestions={ [ 'test-regular.com', 'test-regular.net' ] } />
			</TestDomainSearchWithSuggestions>
		);

		expect( await screen.findByTitle( 'test-regular.com' ) ).toBeInTheDocument();
		expect( await screen.findByTitle( 'test-regular.net' ) ).toBeInTheDocument();
	} );

	it( 'renders nothing if there are no suggestions and no active filters', async () => {
		mockGetSuggestionsQuery( {
			params: { query: 'test-no-suggestions' },
			suggestions: [],
		} );

		const { container } = render(
			<TestDomainSearchWithSuggestions query="test-no-suggestions">
				<SearchResults suggestions={ [] } />
			</TestDomainSearchWithSuggestions>
		);

		await waitForElementToBeRemoved( () => screen.getByText( 'LOADING_TEST_CONTENT' ) );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'allows resetting filters if there are no suggestions but the exact match filter is active', async () => {
		const user = userEvent.setup();
		const onFilterReset = jest.fn();

		mockGetSuggestionsQuery( {
			params: { query: 'test-no-suggestions' },
			suggestions: [],
		} );

		mockGetAvailableTldsQuery( {
			params: { query: 'test-no-suggestions' },
			tlds: [ 'com', 'net', 'org' ],
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-no-suggestions" events={ { onFilterReset } }>
				<Filter />
				<SearchResults suggestions={ [] } />
			</TestDomainSearchWithSuggestions>
		);

		const filterButton = await screen.findByLabelText( 'Filter, no filters applied' );

		// Not sure why we need to double click here.
		await user.dblClick( filterButton );

		await user.click(
			screen.getByRole( 'checkbox', {
				name: 'Show exact matches only',
			} )
		);

		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		const disableFiltersButton = screen.getByRole( 'button', { name: 'Disable filters' } );
		expect( disableFiltersButton ).toBeInTheDocument();

		await user.click( disableFiltersButton );
		expect( onFilterReset ).toHaveBeenCalled();
	} );

	it( 'allows resetting filters if there are no suggestions but the TLD filter is active', async () => {
		const user = userEvent.setup();
		const onFilterReset = jest.fn();

		mockGetSuggestionsQuery( {
			params: { query: 'test-no-suggestions' },
			suggestions: [],
		} );

		mockGetAvailableTldsQuery( {
			params: { query: 'test-no-suggestions' },
			tlds: [ 'com', 'net', 'org' ],
		} );

		render(
			<TestDomainSearchWithSuggestions query="test-no-suggestions" events={ { onFilterReset } }>
				<Filter />
				<SearchResults suggestions={ [] } />
			</TestDomainSearchWithSuggestions>
		);

		const filterButton = await screen.findByLabelText( 'Filter, no filters applied' );

		// Not sure why we need to double click here.
		await user.dblClick( filterButton );

		await user.click(
			screen.getByRole( 'option', {
				name: '.com',
			} )
		);

		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		const disableFiltersButton = screen.getByRole( 'button', { name: 'Disable filters' } );
		expect( disableFiltersButton ).toBeInTheDocument();

		await user.click( disableFiltersButton );
		expect( onFilterReset ).toHaveBeenCalled();
	} );
} );
