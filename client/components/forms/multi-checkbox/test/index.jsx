/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/react';
import MultiCheckbox from '../';

describe( 'index', () => {
	const options = [
		{ value: 1, label: 'One' },
		{ value: 2, label: 'Two' },
	];

	describe( 'rendering', () => {
		test( 'should render a set of checkboxes', () => {
			const { container } = render( <MultiCheckbox name="favorite_colors" options={ options } /> );

			const labels = container.querySelectorAll( 'label' );
			expect( labels ).toHaveLength( options.length );

			labels.forEach( ( label, i ) => {
				const inputNode = label.querySelector( 'input' );
				expect( inputNode.name ).toEqual( 'favorite_colors[]' );
				expect( inputNode.value ).toEqual( options[ i ].value.toString() );
				expect( label.textContent ).toEqual( options[ i ].label );
			} );
		} );

		test( 'should accept an array of checked values', () => {
			const { container } = render(
				<MultiCheckbox
					name="favorite_colors"
					options={ options }
					checked={ [ options[ 0 ].value ] }
				/>
			);
			const labels = container.querySelectorAll( 'label' );

			expect( labels[ 0 ].querySelector( 'input' ).checked ).toBe( true );
			expect( labels[ 1 ].querySelector( 'input' ).checked ).toBe( false );
		} );

		test( 'should accept an array of defaultChecked', () => {
			const { container } = render(
				<MultiCheckbox
					name="favorite_colors"
					options={ options }
					defaultChecked={ [ options[ 0 ].value ] }
				/>
			);
			const labels = container.querySelectorAll( 'label' );

			expect( labels[ 0 ].querySelector( 'input' ).checked ).toBe( true );
			expect( labels[ 1 ].querySelector( 'input' ).checked ).toBe( false );
		} );

		test( 'should accept an onChange event handler', () => {
			const onChange = jest.fn();
			const { container } = render(
				<MultiCheckbox name="favorite_colors" options={ options } onChange={ onChange } />
			);

			// Checkbox values come back from the DOM as strings.
			fireEvent.click( container.querySelector( 'label input' ) );

			expect( onChange ).toHaveBeenCalledWith( { value: [ options[ 0 ].value.toString() ] } );
		} );

		test( 'should accept a disabled boolean', () => {
			const { container } = render(
				<MultiCheckbox name="favorite_colors" options={ options } disabled />
			);
			const labels = container.querySelectorAll( 'label' );

			expect( labels[ 0 ].querySelector( 'input' ).disabled ).toBe( true );
			expect( labels[ 1 ].querySelector( 'input' ).disabled ).toBe( true );
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
