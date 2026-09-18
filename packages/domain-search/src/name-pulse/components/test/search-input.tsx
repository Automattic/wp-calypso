import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { NamePulseSearchInput } from '../search-input';

const DELAY_TIMEOUT = 300;

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
	const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

	render( <StatefulSearch onQueryChange={ onQueryChange } onQueryClear={ onQueryClear } /> );

	return { onQueryChange, onQueryClear, user, input: screen.getByRole( 'searchbox' ) };
};

const advance = ( ms: number ) => {
	act( () => {
		jest.advanceTimersByTime( ms );
	} );
};

describe( 'NamePulseSearchInput', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

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

	it( 'sets the trimmed query once the debounce elapses and keeps typing across the remount', async () => {
		const { user, input, onQueryChange } = renderInput();

		await user.type( input, 'Ice ' );
		advance( DELAY_TIMEOUT - 1 );
		expect( onQueryChange ).not.toHaveBeenCalled();

		advance( 1 );
		expect( onQueryChange ).toHaveBeenCalledTimes( 1 );
		expect( onQueryChange ).toHaveBeenCalledWith( 'ice' );

		const remounted = screen.getByRole( 'searchbox' );
		expect( remounted ).not.toBe( input );
		expect( remounted ).toHaveFocus();
		expect( remounted ).toHaveValue( 'ice' );

		await user.keyboard( ' cream' );
		advance( DELAY_TIMEOUT );
		expect( onQueryChange ).toHaveBeenLastCalledWith( 'ice cream' );
		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'ice cream' );
	} );

	it( 'clearing within the debounce never sets the query and fires onQueryClear', async () => {
		const { user, input, onQueryChange, onQueryClear } = renderInput();

		await user.type( input, 'coffee' );
		await user.clear( input );
		advance( DELAY_TIMEOUT );

		expect( onQueryChange ).not.toHaveBeenCalled();
		expect( onQueryClear ).toHaveBeenCalledTimes( 1 );
	} );
} );
