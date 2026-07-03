/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpacesOnboardingModal } from '../index';

function setup() {
	const onProceed = jest.fn();
	const onClose = jest.fn();
	const user = userEvent.setup();
	renderWithProvider( <SpacesOnboardingModal onProceed={ onProceed } onClose={ onClose } /> );
	return { onProceed, onClose, user };
}

describe( 'SpacesOnboardingModal', () => {
	it( 'opens on the welcome step with Skip and no Back', () => {
		setup();

		expect( screen.getByRole( 'heading', { name: 'Meet Spaces' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Skip' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Show me how' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Back' } ) ).not.toBeInTheDocument();
	} );

	it( 'walks forward and back through the steps', async () => {
		const { user } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Show me how' } ) );
		expect( screen.getByRole( 'heading', { name: 'Sort your feeds by topic' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
		expect( screen.getByRole( 'heading', { name: 'Find more with Discover' } ) ).toBeVisible();
		// The last step swaps Next for the final CTA.
		expect( screen.queryByRole( 'button', { name: 'Next' } ) ).not.toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Back' } ) );
		expect( screen.getByRole( 'heading', { name: 'Sort your feeds by topic' } ) ).toBeVisible();
	} );

	it( 'calls onProceed from the final CTA', async () => {
		const { user, onProceed, onClose } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Show me how' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Create a space' } ) );

		expect( onProceed ).toHaveBeenCalledTimes( 1 );
		expect( onClose ).not.toHaveBeenCalled();
	} );

	it( 'calls onClose from the close button', async () => {
		const { user, onProceed, onClose } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
		expect( onProceed ).not.toHaveBeenCalled();
	} );

	it( 'calls onClose from Skip on the first step', async () => {
		const { user, onClose } = setup();

		await user.click( screen.getByRole( 'button', { name: 'Skip' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );
} );
