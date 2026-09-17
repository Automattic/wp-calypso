/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useViewportMatch } from '@wordpress/compose';
import { SearchForm } from '..';
import { TestDomainSearch } from '../../../test-helpers/renderer';

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

const INSTANT_SEARCH_DEBOUNCE_MS = 300;

const renderForm = ( props: { instantSearch?: boolean } = {} ) => {
	const onQueryChange = jest.fn();
	const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

	render(
		<TestDomainSearch events={ { onQueryChange } }>
			<SearchForm { ...props } />
		</TestDomainSearch>
	);

	return { onQueryChange, user, input: screen.getByRole( 'searchbox' ) };
};

const advance = ( ms: number ) => {
	act( () => {
		jest.advanceTimersByTime( ms );
	} );
};

describe( 'SearchForm instant search', () => {
	beforeEach( () => {
		jest.mocked( useViewportMatch ).mockReturnValue( false );
		jest.useFakeTimers();
	} );

	it( 'hides the submit button', () => {
		renderForm( { instantSearch: true } );

		expect( screen.queryByRole( 'button', { name: 'Search domains' } ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the submit button without instant search', () => {
		renderForm();

		expect( screen.getByRole( 'button', { name: 'Search domains' } ) ).toBeInTheDocument();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'sets the trimmed query once the debounce elapses', async () => {
		const { user, input, onQueryChange } = renderForm( { instantSearch: true } );

		await user.type( input, 'coffee ' );
		advance( INSTANT_SEARCH_DEBOUNCE_MS - 1 );
		expect( onQueryChange ).not.toHaveBeenCalled();

		advance( 1 );
		expect( onQueryChange ).toHaveBeenCalledTimes( 1 );
		expect( onQueryChange ).toHaveBeenCalledWith( 'coffee' );
	} );

	it( 'submitting mid-debounce sets the query at once and drops the pending one', async () => {
		const { user, input, onQueryChange } = renderForm( { instantSearch: true } );

		await user.type( input, 'coffee{enter}' );
		expect( onQueryChange ).toHaveBeenCalledTimes( 1 );
		expect( onQueryChange ).toHaveBeenCalledWith( 'coffee' );

		advance( INSTANT_SEARCH_DEBOUNCE_MS );
		expect( onQueryChange ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'clearing the input cancels a pending debounce', async () => {
		const { user, input, onQueryChange } = renderForm( { instantSearch: true } );

		await user.type( input, 'coffee' );
		await user.clear( input );
		advance( INSTANT_SEARCH_DEBOUNCE_MS );

		expect( onQueryChange ).not.toHaveBeenCalled();
	} );

	it( 'does not set the query while typing in classic mode', async () => {
		const { user, input, onQueryChange } = renderForm();

		await user.type( input, 'coffee' );
		advance( INSTANT_SEARCH_DEBOUNCE_MS );

		expect( onQueryChange ).not.toHaveBeenCalled();
	} );
} );
