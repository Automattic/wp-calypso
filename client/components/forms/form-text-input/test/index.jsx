/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormTextInput from '../';

describe( '<FormTextInput />', () => {
	test( 'should add the provided class names', () => {
		render( <FormTextInput className="test" isError isValid /> );

		const input = screen.getByRole( 'textbox' );

		expect( input ).toHaveClass( 'test' );
		expect( input ).toHaveClass( 'is-error' );
		expect( input ).toHaveClass( 'is-valid' );
	} );

	test( 'should have form-text-input class name', () => {
		render( <FormTextInput /> );

		const input = screen.getByRole( 'textbox' );

		expect( input ).toHaveClass( 'form-text-input' );
	} );

	test( "should pass props aside from component's own to the input", () => {
		render( <FormTextInput placeholder="test placeholder" /> );

		const input = screen.getByRole( 'textbox' );

		expect( input ).toHaveAttribute( 'placeholder', 'test placeholder' );
	} );

	test( 'should call select if selectOnFocus is true', async () => {
		const value = 'arbitrary-value';
		render( <FormTextInput value={ value } selectOnFocus /> );

		const input = screen.getByRole( 'textbox' );

		await userEvent.click( input );

		const selected = input.value.substring( input.selectionStart, input.selectionEnd );

		expect( selected ).toBe( value );
	} );

	test( 'should not call select if selectOnFocus is false', async () => {
		const value = 'arbitrary-value';
		render( <FormTextInput value={ value } selectOnFocus={ false } /> );

		const input = screen.getByRole( 'textbox' );

		await userEvent.click( input );

		const selected = input.value.substring( input.selectionStart, input.selectionEnd );

		expect( selected ).toBe( '' );
	} );
} );
