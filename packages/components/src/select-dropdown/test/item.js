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
			expect( item.firstChild ).toHaveTextContent( 'Published' );
			expect( item.firstChild ).toBe( link );
		} );

		test( 'should contain a default aria-label', () => {
			render( <SelectDropdownItem>Published</SelectDropdownItem> );
			const link = screen.getByRole( 'menuitem', { name: /published/i } );
			expect( link ).toHaveAttribute( 'aria-label', 'Published' );
		} );

		test( 'should default aria-label include a count', () => {
			render( <SelectDropdownItem count={ 123 }>Published</SelectDropdownItem> );
			const link = screen.getByRole( 'menuitem', { name: /published/i } );
			expect( link ).toHaveAttribute( 'aria-label', 'Published (123)' );
		} );

		test( 'should render custom aria-label if provided', () => {
			render(
				<SelectDropdownItem count={ 123 } ariaLabel="My Custom Label">
					Published
				</SelectDropdownItem>
			);
			const link = screen.getByRole( 'menuitem', { name: /my custom label/i } );
			expect( link ).toHaveAttribute( 'aria-label', 'My Custom Label' );
		} );
	} );

	describe( 'when the component is clicked', () => {
		test( 'should do nothing when is disabled', async () => {
			const onClickSpy = jest.fn();
			render(
				<SelectDropdownItem disabled onClick={ onClickSpy }>
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
