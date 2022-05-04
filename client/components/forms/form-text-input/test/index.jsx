/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
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

	test( 'should call select if selectOnFocus is true', () => {
		render( <FormTextInput selectOnFocus={ true } /> );
		const select = jest.fn();
		const event = { target: { select } };

		const input = screen.getByRole( 'textbox' );

		fireEvent.click( input, event );

		expect( select ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should not call select if selectOnFocus is false', () => {
		render( <FormTextInput selectOnFocus={ false } /> );
		const select = jest.fn();
		const event = { target: { select } };

		const input = screen.getByRole( 'textbox' );

		fireEvent.click( input, event );

		expect( select ).not.toHaveBeenCalled();
	} );
} );
