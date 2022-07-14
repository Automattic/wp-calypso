import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Search, { useFuzzySearch } from '..';
import type { UseFuzzySearchOptions } from '../use-fuzzy-search';

const TestComponent = < T, >( props: UseFuzzySearchOptions< T > ) => {
	const { results, setQuery } = useFuzzySearch( props );

	return (
		<>
			<Search onSearch={ setQuery } />
			{ results.map( ( result ) => JSON.stringify( result ) ) }
		</>
	);
};

describe( 'useFuzzySearch', () => {
	it( 'allows fuzzy searching a simple string array', () => {
		const data = [ 'ok', 'hello' ];

		render( <TestComponent data={ data } /> );

		const searchbox = screen.getByRole( 'searchbox' );
		userEvent.type( searchbox, 'k' );

		expect( screen.queryByText( /ok/ ) ).toBeTruthy();
		expect( screen.queryByText( /hello/ ) ).not.toBeTruthy();
	} );

	it( 'allows fuzzy searching an array of objects', () => {
		const data = [ { prop: 'value' }, { prop: 'another' } ];

		render( <TestComponent data={ data } fields={ [ 'prop' ] } /> );

		const searchbox = screen.getByRole( 'searchbox' );
		userEvent.type( searchbox, 'v' );

		expect( screen.queryByText( /value/ ) ).toBeTruthy();
		expect( screen.queryByText( /another/ ) ).not.toBeTruthy();
	} );

	it( 'allows fuzzy searching on nested keys', () => {
		const data = [ { deep: { prop: 'value' } }, { deep: { prop: 'another' } } ];

		render( <TestComponent data={ data } fields={ [ 'deep.prop' ] } /> );

		const searchbox = screen.getByRole( 'searchbox' );
		userEvent.type( searchbox, 'an' );

		expect( screen.queryByText( /another/ ) ).toBeTruthy();
		expect( screen.queryByText( /value/ ) ).not.toBeTruthy();
	} );

	it( 'allows setting an initial query', () => {
		const data = [ { prop: 'value' }, { prop: 'another' } ];

		render( <TestComponent data={ data } fields={ [ 'prop' ] } initialQuery="ano" /> );

		expect( screen.queryByText( /another/ ) ).toBeTruthy();
		expect( screen.queryByText( /value/ ) ).not.toBeTruthy();
	} );
} );
