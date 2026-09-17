import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { NamePulseSearchInput } from '../search-input';

const DELAY_TIMEOUT = 300;

const renderInput = () => {
	const onQueryChange = jest.fn();
	const onQueryClear = jest.fn();
	const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );

	render(
		<TestDomainSearch events={ { onQueryChange, onQueryClear } }>
			<NamePulseSearchInput />
		</TestDomainSearch>
	);

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

	it( 'sets the trimmed query once the debounce elapses', async () => {
		const { user, input, onQueryChange } = renderInput();

		await user.type( input, 'ice cream ' );
		expect( input ).toHaveValue( 'ice cream ' );

		advance( DELAY_TIMEOUT - 1 );
		expect( onQueryChange ).not.toHaveBeenCalled();

		advance( 1 );
		expect( onQueryChange ).toHaveBeenCalledTimes( 1 );
		expect( onQueryChange ).toHaveBeenCalledWith( 'ice cream' );
		expect( input ).toHaveValue( 'ice cream ' );
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
