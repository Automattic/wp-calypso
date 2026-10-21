/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiCheckbox from '../';

describe( 'index', () => {
	const options = [
		{ value: 1, label: 'One' },
		{ value: 2, label: 'Two' },
	];

	describe( 'rendering', () => {
		test( 'should render a set of checkboxes', () => {
			render( <MultiCheckbox name="favorite_colors" options={ options } /> );

			const checkboxes = screen.getAllByRole( 'checkbox' );
			expect( checkboxes ).toHaveLength( options.length );

			checkboxes.forEach( ( checkbox, i ) => {
				expect( checkbox ).toHaveAttribute( 'name', 'favorite_colors[]' );
				expect( checkbox ).toHaveAttribute( 'value', options[ i ].value.toString() );
				expect( checkbox ).toHaveAccessibleName( options[ i ].label );
			} );
		} );

		test( 'should accept an array of checked values', () => {
			render(
				<MultiCheckbox
					name="favorite_colors"
					options={ options }
					checked={ [ options[ 0 ].value ] }
				/>
			);

			expect( screen.getByRole( 'checkbox', { name: 'One' } ) ).toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: 'Two' } ) ).not.toBeChecked();
		} );

		test( 'should accept an array of defaultChecked', () => {
			render(
				<MultiCheckbox
					name="favorite_colors"
					options={ options }
					defaultChecked={ [ options[ 0 ].value ] }
				/>
			);

			expect( screen.getByRole( 'checkbox', { name: 'One' } ) ).toBeChecked();
			expect( screen.getByRole( 'checkbox', { name: 'Two' } ) ).not.toBeChecked();
		} );

		test( 'should accept an onChange event handler', async () => {
			const onChange = jest.fn();
			render( <MultiCheckbox name="favorite_colors" options={ options } onChange={ onChange } /> );

			await userEvent.click( screen.getByRole( 'checkbox', { name: 'One' } ) );

			// Checkbox values come back from the DOM as strings.
			expect( onChange ).toHaveBeenCalledWith( { value: [ options[ 0 ].value.toString() ] } );
		} );

		test( 'should accept a disabled boolean', () => {
			render( <MultiCheckbox name="favorite_colors" options={ options } disabled /> );

			screen.getAllByRole( 'checkbox' ).forEach( ( checkbox ) => {
				expect( checkbox ).toBeDisabled();
			} );
		} );

		test( 'should transfer props to the rendered element', () => {
			const className = 'transferred-class';
			const { container } = render(
				<MultiCheckbox name="favorite_colors" options={ options } className={ className } />
			);

			expect( container.querySelector( 'div' ) ).toHaveClass( className );
		} );
	} );
} );
