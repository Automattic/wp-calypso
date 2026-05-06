/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AltTextPopover } from '../alt-text-popover';

describe( 'AltTextPopover', () => {
	it( 'opens, edits, and saves alt text', async () => {
		const onSave = jest.fn();
		const user = userEvent.setup();
		render( <AltTextPopover currentAlt="" onSave={ onSave } previewUrl="blob:fake" /> );

		await user.click( screen.getByRole( 'button', { name: /add alt text/i } ) );

		const textarea = screen.getByRole( 'textbox', { name: /alt text/i } );
		await user.type( textarea, 'a cat on a windowsill' );
		await user.click( screen.getByRole( 'button', { name: /save/i } ) );

		expect( onSave ).toHaveBeenCalledWith( 'a cat on a windowsill' );
	} );

	it( 'shows existing alt text in the textarea on open', async () => {
		const user = userEvent.setup();
		render( <AltTextPopover currentAlt="prefilled" onSave={ jest.fn() } previewUrl="blob:fake" /> );

		await user.click( screen.getByRole( 'button', { name: /edit alt text/i } ) );

		expect( screen.getByRole( 'textbox', { name: /alt text/i } ) ).toHaveValue( 'prefilled' );
	} );
} );
