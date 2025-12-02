import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestDomainSearch } from '../../../test-helpers/renderer';
import { Input } from '../input';

describe( 'SearchBar#Input', () => {
	it( 'renders the query', () => {
		render(
			<TestDomainSearch query="test">
				<Input />
			</TestDomainSearch>
		);

		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'test' );
	} );

	it( 'changes the input value when the query changes and dispatches the onQueryChange event after a delay', async () => {
		const user = userEvent.setup();

		const onQueryChange = jest.fn();

		render(
			<TestDomainSearch query="test" events={ { onQueryChange } }>
				<Input />
			</TestDomainSearch>
		);

		await user.type( screen.getByRole( 'searchbox' ), '2' );

		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( 'test2' );

		expect( onQueryChange ).not.toHaveBeenCalled();

		await waitFor( () => {
			expect( onQueryChange ).toHaveBeenCalledWith( 'test2' );
		} );
	} );

	it( 'clears the query when the clear button is clicked and dispatches the onQueryClear event', async () => {
		const user = userEvent.setup();

		const onQueryClear = jest.fn();

		render(
			<TestDomainSearch query="test" events={ { onQueryClear } }>
				<Input />
			</TestDomainSearch>
		);

		await user.click( screen.getByRole( 'button', { name: 'Reset search' } ) );

		expect( screen.getByRole( 'searchbox' ) ).toHaveValue( '' );
		expect( onQueryClear ).toHaveBeenCalled();
	} );
} );
