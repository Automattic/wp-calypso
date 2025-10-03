/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTagForm } from '../index';

describe( 'AddTagForm', () => {
	it( 'submits a new tag', async () => {
		const onAction = jest.fn();
		render( <AddTagForm onAction={ onAction } /> );

		await userEvent.type( screen.getByRole( 'textbox', { name: 'Add a tag' } ), 'test' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Add' } ) );

		expect( onAction ).toHaveBeenCalledWith( 'test' );
	} );

	it( 'disables button if there is not tag value', async () => {
		render( <AddTagForm onAction={ () => {} } /> );

		//toBeDisabled is not applicable here because the button is not disabled, but it is aria-disabled
		expect( screen.getByRole( 'button', { name: 'Add' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'does not call onAction if the tag is not valid', async () => {
		const onAction = jest.fn();
		render( <AddTagForm onAction={ onAction } /> );

		await userEvent.type( screen.getByRole( 'textbox', { name: 'Add a tag' } ), 't' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Add' } ) );

		expect( onAction ).not.toHaveBeenCalled();
	} );
} );
