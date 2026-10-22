/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaygroundConfirmModal } from '../components/playground-confirm-modal';

const renderModal = ( props: Partial< Parameters< typeof PlaygroundConfirmModal >[ 0 ] > = {} ) => {
	const onConfirm = jest.fn();
	const onCancel = jest.fn();

	render(
		<PlaygroundConfirmModal
			title="Confirm title"
			confirmLabel="Do it"
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			{ ...props }
		>
			<p>Body copy</p>
		</PlaygroundConfirmModal>
	);

	return { onConfirm, onCancel };
};

describe( 'PlaygroundConfirmModal', () => {
	let getClientRectsSpy: jest.SpyInstance;

	beforeEach( () => {
		// jsdom has no layout, so the Modal can't find a tabbable element to focus on mount.
		getClientRectsSpy = jest
			.spyOn( HTMLElement.prototype, 'getClientRects' )
			.mockReturnValue( [ {} ] as unknown as DOMRectList );
	} );

	afterEach( () => {
		getClientRectsSpy.mockRestore();
	} );

	it( 'renders the title, body and actions', () => {
		renderModal();

		const dialog = screen.getByRole( 'dialog', { name: 'Confirm title' } );
		expect( dialog ).toHaveAccessibleDescription( 'Body copy' );
		expect( screen.getByRole( 'button', { name: 'Keep building' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Do it' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Close' } ) ).toBeVisible();
	} );

	it( 'accepts a custom cancel label', () => {
		renderModal( { cancelLabel: 'Not now' } );

		expect( screen.getByRole( 'button', { name: 'Not now' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Keep building' } ) ).not.toBeInTheDocument();
	} );

	it( 'moves focus to the cancel button when opened', async () => {
		renderModal();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Keep building' } ) ).toHaveFocus()
		);
	} );

	it( 'calls onConfirm from the confirm button', async () => {
		const { onConfirm, onCancel } = renderModal();

		await userEvent.click( screen.getByRole( 'button', { name: 'Do it' } ) );

		expect( onConfirm ).toHaveBeenCalledTimes( 1 );
		expect( onCancel ).not.toHaveBeenCalled();
	} );

	it( 'calls onCancel from the cancel button', async () => {
		const { onConfirm, onCancel } = renderModal();

		await userEvent.click( screen.getByRole( 'button', { name: 'Keep building' } ) );

		expect( onCancel ).toHaveBeenCalledTimes( 1 );
		expect( onConfirm ).not.toHaveBeenCalled();
	} );

	it( 'calls onCancel from the close button', async () => {
		const { onCancel } = renderModal();

		await userEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

		await waitFor( () => expect( onCancel ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'calls onCancel when Escape is pressed', async () => {
		const { onCancel } = renderModal();

		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Keep building' } ) ).toHaveFocus()
		);
		await userEvent.keyboard( '{Escape}' );

		await waitFor( () => expect( onCancel ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'calls onCancel when clicking outside the modal', async () => {
		const { onCancel } = renderModal();

		const overlay = document.querySelector( '.components-modal__screen-overlay' ) as HTMLElement;
		await userEvent.click( overlay );

		await waitFor( () => expect( onCancel ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'disables the confirm button while confirming', async () => {
		const { onConfirm } = renderModal( { isConfirming: true } );

		const confirmButton = screen.getByRole( 'button', { name: 'Do it' } );
		expect( confirmButton ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.click( confirmButton );
		expect( onConfirm ).not.toHaveBeenCalled();
	} );
} );
