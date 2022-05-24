/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectDropdownItem from '../item';

describe( 'item', () => {
	describe( 'component rendering', () => {
		test( 'should render a list entry', () => {
			render( <SelectDropdownItem>Published</SelectDropdownItem> );
			const item = screen.queryByRole( 'listitem' );
			expect( item ).toBeInTheDocument();
		} );

		test( 'should contain a link', () => {
			render( <SelectDropdownItem>Published</SelectDropdownItem> );
			const item = screen.getByRole( 'listitem' );
			const link = screen.getByRole( 'menuitem', { name: /published/i } );
			expect( item.firstChild.textContent ).toBe( 'Published' );
			expect( item.firstChild ).toBe( link );
		} );
	} );

	describe( 'when the component is clicked', () => {
		test( 'should do nothing when is disabled', async () => {
			const onClickSpy = jest.fn();
			render(
				<SelectDropdownItem disabled={ true } onClick={ onClickSpy }>
					Published
				</SelectDropdownItem>
			);

			const link = screen.getByRole( 'menuitem', { name: /published/i } );
			await userEvent.click( link );

			expect( onClickSpy ).not.toHaveBeenCalled();
		} );

		test( 'should run the `onClick` hook', async () => {
			const onClickSpy = jest.fn();
			render( <SelectDropdownItem onClick={ onClickSpy }>Published</SelectDropdownItem> );

			const link = screen.getByRole( 'menuitem', { name: /published/i } );
			await userEvent.click( link );

			expect( onClickSpy ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
