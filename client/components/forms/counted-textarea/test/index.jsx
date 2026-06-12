/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CountedTextarea } from '../';

const getWrapper = ( container ) => container.querySelector( '.counted-textarea' );
const getCountPanel = ( container ) => container.querySelector( '.counted-textarea__count-panel' );

describe( 'index', () => {
	test( 'should render the character count of the passed value', () => {
		const { container } = render( <CountedTextarea value="Hello World!" /> );

		expect( getWrapper( container ) ).toHaveClass( 'counted-textarea' );
		expect( getCountPanel( container ) ).toHaveTextContent( '12 characters' );
	} );

	test( 'should render warning styles when the acceptable length is exceeded', () => {
		const { container } = render(
			<CountedTextarea value="Hello World!" acceptableLength={ 10 } />
		);

		expect( getWrapper( container ) ).toHaveClass( 'is-exceeding-acceptable-length' );
	} );

	test( 'should apply className to the wrapper element', () => {
		const { container } = render(
			<CountedTextarea value="Hello World!" className="custom-class" />
		);

		expect( getWrapper( container ) ).toHaveClass( 'counted-textarea', 'custom-class' );
	} );

	test( 'should pass props to the child textarea', () => {
		const value = 'Hello World!';
		const placeholder = 'placeholder test';

		render(
			<CountedTextarea value={ value } className="custom-class" placeholder={ placeholder } />
		);
		const textarea = screen.getByRole( 'textbox' );

		expect( textarea ).toHaveValue( value );
		expect( textarea ).toHaveAttribute( 'placeholder', placeholder );
		expect( textarea ).toHaveClass( 'counted-textarea__input' );
	} );

	test( 'should not use the placeholder as the counted item if value is empty and countPlaceholderLength is not set', () => {
		const { container } = render(
			<CountedTextarea value="" className="custom-class" placeholder="placeholder test" />
		);

		expect( getCountPanel( container ) ).toHaveTextContent( '0 characters' );
	} );

	test( 'should use the placeholder as the counted item if value is empty and countPlaceholderLength is true', () => {
		const { container } = render(
			<CountedTextarea
				value=""
				className="custom-class"
				placeholder="placeholder test"
				countPlaceholderLength
			/>
		);

		expect( getCountPanel( container ) ).toHaveTextContent( '16 characters' );
	} );

	test( 'should use the value as the counted item if value is set', () => {
		const { container } = render(
			<CountedTextarea
				value="Hello World!"
				className="custom-class"
				placeholder="placeholder test"
			/>
		);

		expect( getCountPanel( container ) ).toHaveTextContent( '12 characters' );
	} );

	test( 'should not pass acceptableLength prop to the child textarea', () => {
		const value = 'Hello World!';

		render( <CountedTextarea value={ value } className="custom-class" acceptableLength={ 140 } /> );
		const textarea = screen.getByRole( 'textbox' );

		expect( textarea ).toHaveValue( value );
		expect( textarea ).not.toHaveAttribute( 'acceptablelength' );
		expect( textarea ).toHaveClass( 'counted-textarea__input' );
	} );

	test( 'should render a reversed count when set to showRemainingCount', () => {
		const { container } = render(
			<CountedTextarea value="Hello World!" acceptableLength={ 140 } showRemainingCharacters />
		);

		expect( getWrapper( container ) ).toHaveClass( 'counted-textarea' );
		expect( getCountPanel( container ) ).toHaveTextContent( '128 characters remaining' );
	} );

	test( 'should render additional panel content when set', () => {
		const { container } = render(
			<CountedTextarea value="Hello World!" acceptableLength={ 140 } showRemainingCharacters>
				Extra stuff
			</CountedTextarea>
		);
		const countPanel = getCountPanel( container );

		expect( getWrapper( container ) ).toHaveClass( 'counted-textarea' );
		expect( countPanel ).toHaveTextContent( '128 characters remaining' );
		expect( countPanel ).toHaveTextContent( 'Extra stuff' );
	} );
} );
