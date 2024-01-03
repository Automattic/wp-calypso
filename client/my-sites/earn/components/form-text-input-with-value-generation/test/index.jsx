/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import FormTextInputWithValueGeneration from '../index';

describe( 'FormTextInputWithValueGeneration', () => {
	test( 'should render', () => {
		const { container } = render( <FormTextInputWithValueGeneration action="Random" /> );
		expect( container ).toMatchSnapshot();
	} );

	test( 'should generate a value when the action button is clicked', async () => {
		let value = '';
		render(
			<FormTextInputWithValueGeneration
				value={ value }
				onAction={ () => {
					value = 'generated value';
				} }
				action="Random"
			/>
		);
		const actionButton = await screen.getByText( 'Random' );
		await actionButton.click();
		await waitFor( async () => {
			expect( value ).toEqual( 'generated value' );
		} );
	} );
} );
