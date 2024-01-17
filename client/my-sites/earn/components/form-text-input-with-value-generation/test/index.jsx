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

	test( 'should generate a value when the action button is clicked', async () => {
		const user = userEvent.setup();
		const generateValueCallback = jest.fn();
		render( <FormTextInputWithValueGeneration onAction={ generateValueCallback } /> );
		const generateButton = getGenerateButton();

		await user.click( generateButton );
		expect( generateValueCallback ).toHaveBeenCalledTimes( 1 );
	} );
} );
