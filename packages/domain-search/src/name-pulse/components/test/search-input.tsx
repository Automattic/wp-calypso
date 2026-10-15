import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { NamePulseSearchInput } from '../search-input';

const StatefulSearch = ( {
	onQueryChange,
	onQueryClear,
}: {
	onQueryChange: jest.Mock;
	onQueryClear: jest.Mock;
} ) => {
	const [ query, setQuery ] = useState( '' );

	return (
		<TestDomainSearch
			query={ query }
			events={ {
				onQueryChange: ( value: string ) => {
					onQueryChange( value );
					setQuery( value.toLowerCase() );
				},
				onQueryClear,
			} }
		>
			<NamePulseSearchInput key={ query ? 'results' : 'initial' } />
		</TestDomainSearch>
	);
};

const renderInput = () => {
	const onQueryChange = jest.fn();
	const onQueryClear = jest.fn();
	const user = userEvent.setup();

	render( <StatefulSearch onQueryChange={ onQueryChange } onQueryClear={ onQueryClear } /> );

	return { onQueryChange, onQueryClear, user, input: screen.getByRole( 'searchbox' ) };
};

const queriesSet = ( onQueryChange: jest.Mock ) =>
	onQueryChange.mock.calls.map( ( [ value ] ) => value );

describe( 'NamePulseSearchInput', () => {
	it( 'renders no submit button', () => {
		renderInput();

		expect( screen.queryByRole( 'button', { name: 'Search domains' } ) ).not.toBeInTheDocument();
	} );

	it( 'marks the search bar so the Name Pulse styles can place the icon on the right', () => {
		const { input } = renderInput();

		expect( input.closest( '.domain-search__search-bar' ) ).toHaveClass(
			'name-pulse-search-input'
		);
	} );

	it( 'focuses the input on mount', () => {
		const { input } = renderInput();

		expect( input ).toHaveFocus();
	} );

	it( 'sets the trimmed query on every keystroke and keeps typing across the remount', async () => {
		const { user, input, onQueryChange } = renderInput();

		await user.type( input, 'Ice ' );
		expect( queriesSet( onQueryChange ) ).toEqual( [ 'i', 'ic', 'ice', 'ice' ] );

		const remounted = screen.getByRole( 'searchbox' );
		expect( remounted ).not.toBe( input );
		expect( remounted ).toHaveFocus();
		expect( remounted ).toHaveValue( 'ice ' );

		await user.keyboard( 'cream' );
		expect( onQueryChange ).toHaveBeenLastCalledWith( 'ice cream' );
		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'ice cream' );
	} );

	it( 'keeps characters the query drops in the box while typing', async () => {
		const { user, input, onQueryChange } = renderInput();

		await user.type( input, 'ice_cream!' );

		expect( onQueryChange ).toHaveBeenLastCalledWith( 'icecream' );
		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'ice_cream!' );
	} );

	it( 'clearing fires onQueryClear and leaves the last query in place', async () => {
		const { user, input, onQueryChange, onQueryClear } = renderInput();

		await user.type( input, 'coffee' );
		expect( onQueryChange ).toHaveBeenLastCalledWith( 'coffee' );

		await user.clear( screen.getByRole( 'searchbox' ) );

		expect( onQueryClear ).toHaveBeenCalledTimes( 1 );
		expect( onQueryChange ).toHaveBeenLastCalledWith( 'coffee' );
		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( '' );
	} );

	describe( 'when the search bar is scrolled above the viewport', () => {
		const scrollIntoView = jest.fn();

		beforeEach( () => {
			Element.prototype.scrollIntoView = scrollIntoView;
		} );

		afterEach( () => {
			// @ts-expect-error jsdom does not implement scrollIntoView.
			delete Element.prototype.scrollIntoView;
			scrollIntoView.mockClear();
			jest.restoreAllMocks();
		} );

		const placeSearchBarAt = ( top: number ) =>
			jest.spyOn( HTMLElement.prototype, 'getBoundingClientRect' ).mockImplementation( function (
				this: HTMLElement
			) {
				return {
					top: this.classList.contains( 'name-pulse-search-input' ) ? top : 0,
				} as DOMRect;
			} );

		it( 'scrolls the whole bar back into view when the query is edited', async () => {
			placeSearchBarAt( -120 );
			const { user, input } = renderInput();

			await user.type( input, 'x' );

			expect( scrollIntoView ).toHaveBeenCalledWith( { block: 'start' } );
			expect( scrollIntoView.mock.contexts[ 0 ] ).toHaveClass( 'name-pulse-search-input' );
		} );

		it( 'leaves the page where it is while the bar is in view', async () => {
			placeSearchBarAt( 40 );
			const { user, input } = renderInput();

			await user.type( input, 'ice' );

			expect( scrollIntoView ).not.toHaveBeenCalled();
		} );
	} );
} );
