import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockGetSuggestionsQuery } from '../../../test-helpers/queries/suggestions';
import { mockGetAvailableTldsQuery } from '../../../test-helpers/queries/tlds';
import { TestDomainSearch, TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';
import { Filter } from '../filter';

describe( 'SearchBar#Filter', () => {
	it( 'allows the user to filter by TLDs', async () => {
		const user = userEvent.setup();

		mockGetSuggestionsQuery( {
			params: { query: 'test' },
			suggestions: [],
		} );

		mockGetSuggestionsQuery( {
			params: { query: 'test', tlds: [ 'com' ] },
			suggestions: [],
		} );

		mockGetAvailableTldsQuery( {
			params: { query: 'test' },
			tlds: [ 'com', 'net', 'org' ],
		} );

		const onFilterApplied = jest.fn();

		render(
			<TestDomainSearchWithSuggestions query="test" events={ { onFilterApplied } }>
				<Filter />
			</TestDomainSearchWithSuggestions>
		);

		const filterButton = await screen.findByRole( 'button', {
			name: 'Filter, no filters applied',
		} );

		await user.dblClick( filterButton );

		const tldOption = await screen.findByRole( 'option', { name: '.com' } );
		await user.click( tldOption );

		const applyButton = await screen.findByRole( 'button', { name: 'Apply' } );
		await user.click( applyButton );

		await waitFor( () => {
			expect( screen.getByLabelText( 'Filter, 1 filter applied' ) ).toBeInTheDocument();
		} );

		expect( onFilterApplied ).toHaveBeenCalledWith( {
			tlds: [ 'com' ],
			exactSldMatchesOnly: false,
		} );
	} );

	it( 'allows the user to filter by exact match only', async () => {
		const user = userEvent.setup();

		mockGetSuggestionsQuery( {
			params: { query: 'test' },
			suggestions: [],
		} );

		mockGetSuggestionsQuery( {
			params: { query: 'test', tlds: [ 'net' ], exact_sld_matches_only: true },
			suggestions: [],
		} );

		mockGetAvailableTldsQuery( {
			params: { query: 'test' },
			tlds: [ 'com', 'net', 'org' ],
		} );

		const onFilterApplied = jest.fn();

		render(
			<TestDomainSearchWithSuggestions query="test" events={ { onFilterApplied } }>
				<Filter />
			</TestDomainSearchWithSuggestions>
		);

		const filterButton = await screen.findByRole( 'button', {
			name: 'Filter, no filters applied',
		} );

		await user.dblClick( filterButton );

		const sldCheckbox = await screen.findByRole( 'checkbox', { name: 'Show exact matches only' } );
		await user.click( sldCheckbox );

		const tldOption = await screen.findByRole( 'option', { name: '.net' } );
		await user.click( tldOption );

		const applyButton = await screen.findByRole( 'button', { name: 'Apply' } );
		await user.click( applyButton );

		await waitFor( () => {
			expect( screen.getByLabelText( 'Filter, 2 filters applied' ) ).toBeInTheDocument();
		} );

		expect( onFilterApplied ).toHaveBeenCalledWith( {
			tlds: [ 'net' ],
			exactSldMatchesOnly: true,
		} );
	} );

	it( 'allows the user to clear the filter', async () => {
		const user = userEvent.setup();

		mockGetSuggestionsQuery( {
			params: { query: 'test' },
			suggestions: [],
		} );

		mockGetSuggestionsQuery( {
			params: { query: 'test', tlds: [ 'net' ], exact_sld_matches_only: true },
			suggestions: [],
		} );

		mockGetAvailableTldsQuery( {
			params: { query: 'test' },
			tlds: [ 'com', 'net', 'org' ],
		} );

		const onFilterReset = jest.fn();

		render(
			<TestDomainSearch query="test" events={ { onFilterReset } }>
				<Filter />
			</TestDomainSearch>
		);

		let filterButton = await screen.findByRole( 'button', {
			name: 'Filter, no filters applied',
		} );

		await user.dblClick( filterButton );

		const sldCheckbox = await screen.findByRole( 'checkbox', { name: 'Show exact matches only' } );
		await user.click( sldCheckbox );

		const tldOption = await screen.findByRole( 'option', { name: '.net' } );
		await user.click( tldOption );

		const applyButton = await screen.findByRole( 'button', { name: 'Apply' } );
		await user.click( applyButton );

		await waitFor( () => {
			expect( screen.getByLabelText( 'Filter, 2 filters applied' ) ).toBeInTheDocument();
		} );

		filterButton = await screen.findByRole( 'button', {
			name: 'Filter, 2 filters applied',
		} );

		await user.click( filterButton );

		const clearButton = await screen.findByRole( 'button', { name: 'Clear' } );
		await user.click( clearButton );

		await waitFor( () => {
			expect( screen.getByLabelText( 'Filter, no filters applied' ) ).toBeInTheDocument();
		} );

		expect( onFilterReset ).toHaveBeenCalledWith(
			{
				tlds: [],
				exactSldMatchesOnly: false,
			},
			[ 'tlds', 'exactSldMatchesOnly' ]
		);
	} );

	it( 'does not render if there are no available TLDs', async () => {
		const tldsQuery = mockGetAvailableTldsQuery( {
			params: { query: 'test' },
			tlds: [],
		} );

		const { container } = render(
			<TestDomainSearch query="test">
				<Filter />
			</TestDomainSearch>
		);

		await waitFor( () => {
			expect( tldsQuery.isDone() ).toBeTruthy();
		} );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'disables the filter button if the TLDs are still loading', async () => {
		mockGetAvailableTldsQuery( {
			params: { query: 'test' },
			tlds: [],
		} );

		render(
			<TestDomainSearch query="test">
				<Filter />
			</TestDomainSearch>
		);

		expect(
			await screen.findByRole( 'button', { name: 'Filter, no filters applied' } )
		).toBeDisabled();
	} );

	describe( 'allowed TLDs', () => {
		it( 'limits the filterable TLDs to the allowed TLDs and includes them by default in the suggestion query', async () => {
			const user = userEvent.setup();

			const suggestionsQuery = mockGetSuggestionsQuery( {
				params: { query: 'test', tlds: [ 'com', 'net' ] },
				suggestions: [],
			} );

			mockGetAvailableTldsQuery( {
				params: { query: 'test' },
				tlds: [ 'com', 'net', 'org' ],
			} );

			render(
				<TestDomainSearchWithSuggestions query="test" config={ { allowedTlds: [ 'com', 'net' ] } }>
					<Filter />
				</TestDomainSearchWithSuggestions>
			);

			const filterButton = await screen.findByRole( 'button', {
				name: 'Filter, no filters applied',
			} );

			await user.dblClick( filterButton );

			expect( screen.getByRole( 'option', { name: '.com' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'option', { name: '.net' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'option', { name: '.org' } ) ).not.toBeInTheDocument();

			await waitFor( () => {
				expect( suggestionsQuery.isDone() ).toBeTruthy();
			} );
		} );

		it( 'includes only the subset of allowed filtered TLDs in the suggestion query', async () => {
			const user = userEvent.setup();

			mockGetSuggestionsQuery( {
				params: { query: 'test', tlds: [ 'com', 'net' ] },
				suggestions: [],
			} );

			const suggestionsQuery = mockGetSuggestionsQuery( {
				params: { query: 'test', tlds: [ 'com' ] },
				suggestions: [],
			} );

			mockGetAvailableTldsQuery( {
				params: { query: 'test' },
				tlds: [ 'com', 'net', 'org' ],
			} );

			const onFilterApplied = jest.fn();

			render(
				<TestDomainSearchWithSuggestions
					query="test"
					config={ { allowedTlds: [ 'com', 'net' ] } }
					events={ { onFilterApplied } }
				>
					<Filter />
				</TestDomainSearchWithSuggestions>
			);

			const filterButton = await screen.findByRole( 'button', {
				name: 'Filter, no filters applied',
			} );

			await user.dblClick( filterButton );

			const tldOption = await screen.findByRole( 'option', { name: '.com' } );
			await user.click( tldOption );

			const applyButton = await screen.findByRole( 'button', { name: 'Apply' } );
			await user.click( applyButton );

			expect( onFilterApplied ).toHaveBeenCalledWith( {
				tlds: [ 'com' ],
				exactSldMatchesOnly: false,
			} );

			await waitFor( () => {
				expect( suggestionsQuery.isDone() ).toBeTruthy();
			} );
		} );
	} );
} );
