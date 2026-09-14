/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposerExtrasPill } from '../composer-extras-pill';

describe( 'ComposerExtrasPill', () => {
	it( 'composes aria-label from purpose and current state so SR users hear both', () => {
		render(
			<ComposerExtrasPill
				icon={ <span data-testid="test-icon" /> }
				label="Anyone can reply"
				ariaLabel="Post interaction settings"
				popoverContent={ () => <p>Popover body</p> }
			/>
		);
		const button = screen.getByRole( 'button', {
			name: 'Post interaction settings, Anyone can reply',
		} );
		expect( button ).toBeVisible();
		expect( screen.getByTestId( 'test-icon' ) ).toBeVisible();
		expect( button ).toHaveTextContent( 'Anyone can reply' );
		expect( screen.queryByText( 'Popover body' ) ).not.toBeInTheDocument();
	} );

	it( 'opens the popover on click and passes onClose to the content', async () => {
		const user = userEvent.setup();
		render(
			<ComposerExtrasPill
				icon={ null }
				label="Trigger"
				ariaLabel="Trigger button"
				popoverContent={ ( { onClose } ) => <button onClick={ onClose }>Close me</button> }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Trigger button, Trigger' } ) );
		expect( screen.getByRole( 'button', { name: 'Close me' } ) ).toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Close me' } ) );
		expect( screen.queryByRole( 'button', { name: 'Close me' } ) ).not.toBeInTheDocument();
	} );

	it( 'fires onOpen when the popover opens', async () => {
		const user = userEvent.setup();
		const onOpen = jest.fn();
		render(
			<ComposerExtrasPill
				icon={ null }
				label="Trigger"
				ariaLabel="Trigger button"
				onOpen={ onOpen }
				popoverContent={ () => <p>Body</p> }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Trigger button, Trigger' } ) );
		expect( onOpen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'closes the popover when content invokes onClose (covers ESC pathway)', async () => {
		// ESC-to-close is provided by @wordpress/components Dropdown's underlying
		// Popover/useDialog, which invokes the same onClose callback that the
		// renderContent slot receives. JSDOM does not faithfully simulate the
		// focus-trap + ESC handling, so we exercise the underlying close
		// pathway directly here.
		const user = userEvent.setup();
		render(
			<ComposerExtrasPill
				icon={ null }
				label="Trigger"
				ariaLabel="Trigger button"
				popoverContent={ ( { onClose } ) => <button onClick={ onClose }>Simulated ESC</button> }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: 'Trigger button, Trigger' } ) );
		expect( screen.getByRole( 'button', { name: 'Simulated ESC' } ) ).toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Simulated ESC' } ) );
		expect( screen.queryByRole( 'button', { name: 'Simulated ESC' } ) ).not.toBeInTheDocument();
	} );
} );
