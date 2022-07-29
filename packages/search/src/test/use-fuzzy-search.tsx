import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import Search, { useFuzzySearch } from '..';
import type { UseFuzzySearchOptions } from '../use-fuzzy-search';
import '@testing-library/jest-dom';

const TestComponent = < T, >( props: UseFuzzySearchOptions< T > ) => {
	const [ query, setQuery ] = useState( props.query );
	const results = useFuzzySearch( { ...props, query } );

	return (
		<>
			<Search onSearch={ setQuery } />
			{ results.map( ( result ) => JSON.stringify( result.item ) ) }
		</>
	);
};

describe( 'useFuzzySearch', () => {
	it( 'allows fuzzy searching a simple string array', async () => {
		const user = userEvent.setup();

		const data = [ 'ok', 'hello' ];

		render( <TestComponent data={ data } /> );

		const searchbox = screen.getByRole( 'searchbox' );
		await user.type( searchbox, 'k' );

		expect( screen.queryByText( /ok/ ) ).toBeVisible();
		expect( screen.queryByText( /hello/ ) ).not.toBeInTheDocument();
	} );

	it( 'allows fuzzy searching an array of objects', async () => {
		const user = userEvent.setup();

		const data = [ { prop: 'value' }, { prop: 'another' } ];

		render( <TestComponent data={ data } keys={ [ 'prop' ] } /> );

		const searchbox = screen.getByRole( 'searchbox' );
		await user.type( searchbox, 'v' );

		expect( screen.queryByText( /value/ ) ).toBeVisible();
		expect( screen.queryByText( /another/ ) ).not.toBeInTheDocument();
	} );

	it( 'allows fuzzy searching on nested keys', async () => {
		const user = userEvent.setup();

		const data = [ { deep: { prop: 'value' } }, { deep: { prop: 'another' } } ];

		render( <TestComponent data={ data } keys={ [ 'deep.prop' ] } /> );

		const searchbox = screen.getByRole( 'searchbox' );
		await user.type( searchbox, 'an' );

		expect( screen.queryByText( /another/ ) ).toBeVisible();
		expect( screen.queryByText( /value/ ) ).not.toBeInTheDocument();
	} );

	it( 'allows setting an initial query', () => {
		const data = [ { prop: 'value' }, { prop: 'another' } ];

		render( <TestComponent data={ data } keys={ [ 'prop' ] } query="ano" /> );

		expect( screen.queryByText( /another/ ) ).toBeVisible();
		expect( screen.queryByText( /value/ ) ).not.toBeInTheDocument();
	} );
} );
