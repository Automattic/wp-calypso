/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyboardShortcuts } from '..';

describe( 'KeyboardShortcuts', () => {
	it( 'asks to open when the button is clicked', async () => {
		const user = userEvent.setup();
		const onToggle = jest.fn();
		render( <KeyboardShortcuts isOpen={ false } onToggle={ onToggle } /> );

		await user.click( screen.getByRole( 'button', { name: 'Keyboard shortcuts' } ) );

		expect( onToggle ).toHaveBeenCalledWith( true );
	} );

	it( 'lists every shortcut while open', () => {
		render( <KeyboardShortcuts isOpen onToggle={ jest.fn() } /> );

		for ( const label of [
			'Next',
			'Previous',
			'Previous tab',
			'Next tab',
			'View all',
			'View unread',
			'View your comments',
			'Toggle shortcuts menu',
		] ) {
			expect( screen.getByText( label ) ).toBeInTheDocument();
		}
	} );

	it( 'hides the list while closed', () => {
		render( <KeyboardShortcuts isOpen={ false } onToggle={ jest.fn() } /> );

		expect( screen.queryByText( 'View unread' ) ).not.toBeInTheDocument();
	} );
} );
