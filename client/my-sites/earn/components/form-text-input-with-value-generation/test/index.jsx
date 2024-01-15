/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import FormTextInputWithValueGeneration from '../index';

describe( 'FormTextInputWithValueGeneration', () => {
	test( 'should render', () => {
		const { container } = render( <FormTextInputWithValueGeneration /> );
		expect( container ).toMatchSnapshot();
	} );

	test( 'should generate a value when the action button is clicked', () => {
		const generateValueCallback = jest.fn();
		render( <FormTextInputWithValueGeneration onAction={ generateValueCallback } /> );
		const actionButton = screen.getByRole( 'button', { name: 'generate value' } );
		actionButton.click();
		expect( generateValueCallback ).toHaveBeenCalledTimes( 1 );
	} );
} );
