/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormTextInputWithValueGeneration from '../index';

describe( 'FormTextInputWithValueGeneration', () => {
	const getTextboxInput = () => screen.getByRole( 'textbox', { name: 'Enter value' } );
	const getGenerateButton = () => screen.getByRole( 'button', { name: 'Generate value' } );

	test( 'should render', () => {
		render( <FormTextInputWithValueGeneration /> );
		const textboxInput = getTextboxInput();
		const generateButton = getGenerateButton();

		expect( textboxInput ).not.toHaveValue();
		expect( textboxInput ).not.toBeDisabled();
		expect( generateButton ).not.toBeDisabled();
	} );

	test( 'should disable button and textbox when disabled', () => {
		render( <FormTextInputWithValueGeneration disabled /> );
		const textboxInput = getTextboxInput();
		const generateButton = getGenerateButton();

		expect( textboxInput ).toBeDisabled();
		expect( generateButton ).toBeDisabled();
	} );

	test( 'should execute the onAction callback function when the action button is clicked', async () => {
		const user = userEvent.setup();
		const generateValueCallback = jest.fn();
		render( <FormTextInputWithValueGeneration onAction={ generateValueCallback } /> );
		const generateButton = getGenerateButton();

		await user.click( generateButton );
		expect( generateValueCallback ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should display the value in text area after clicking action button on rerender', async () => {
		let generatedValue = '';
		const user = userEvent.setup();
		const generateValueCallback = jest
			.fn()
			.mockImplementation( () => ( generatedValue = 'value generated from callback function' ) );
		const { rerender } = render(
			<FormTextInputWithValueGeneration
				value={ generatedValue }
				onAction={ generateValueCallback }
			/>
		);
		const textboxInput = getTextboxInput();
		const generateButton = getGenerateButton();
		expect( textboxInput ).not.toHaveValue();

		await user.click( generateButton );

		rerender(
			<FormTextInputWithValueGeneration
				value={ generatedValue }
				onAction={ generateValueCallback }
			/>
		);
		const rerenderedTextboxInput = getTextboxInput();

		expect( generateValueCallback ).toHaveBeenCalledTimes( 1 );
		expect( rerenderedTextboxInput ).toHaveValue( 'value generated from callback function' );
	} );
} );
