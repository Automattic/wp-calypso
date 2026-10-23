/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaygroundConfirmModal } from '../components/playground-confirm-modal';

const renderModal = ( props: Partial< Parameters< typeof PlaygroundConfirmModal >[ 0 ] > = {} ) => {
	const onConfirm = jest.fn();
	const onCancel = jest.fn();
	const renderWith = ( overrides: typeof props ) => (
		<PlaygroundConfirmModal
			title="Confirm title"
			description="Body copy"
			confirmLabel="Do it"
			cancelLabel="Keep building"
			onConfirm={ onConfirm }
			onCancel={ onCancel }
			{ ...overrides }
		/>
	);

	const { rerender } = render( renderWith( props ) );

	return {
		onConfirm,
		onCancel,
		rerender: ( overrides: typeof props ) => rerender( renderWith( overrides ) ),
	};
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

	it( 'describes the dialog with the description only', () => {
		renderModal( { children: <p>More details</p> } );

		const dialog = screen.getByRole( 'dialog', { name: 'Confirm title' } );
		expect( dialog ).toHaveAccessibleDescription( 'Body copy' );
		expect( screen.getByText( 'Body copy' ) ).toBeVisible();
		expect( screen.getByText( 'More details' ) ).toBeVisible();
		expect( screen.getByText( 'Body copy' ).nextElementSibling ).toBe(
			screen.getByText( 'More details' )
		);
	} );

	it( 'uses the cancel label it is given', () => {
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

	it( 'renders the actions in one footer row', () => {
		renderModal();

		const footer = document.querySelector( '.confirm-dialog__footer' ) as HTMLElement;
		expect( footer ).toHaveClass( 'playground-confirm-modal__actions' );
		expect( Array.from( footer.children ).map( ( button ) => button.textContent ) ).toEqual( [
			'Keep building',
			'Do it',
		] );
		expect( screen.getByRole( 'button', { name: 'Keep building' } ) ).toHaveClass( 'is-tertiary' );
		expect( screen.getByRole( 'button', { name: 'Do it' } ) ).toHaveClass( 'is-primary' );
	} );

	it( 'disables the confirm button while confirming', async () => {
		const { onConfirm } = renderModal( { isConfirming: true } );

		const confirmButton = screen.getByRole( 'button', { name: 'Do it' } );
		expect( confirmButton ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.click( confirmButton );
		expect( onConfirm ).not.toHaveBeenCalled();
	} );

	it( 'blocks every dismissal while confirming', async () => {
		const { onCancel } = renderModal( { isConfirming: true } );

		expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument();
		const cancelButton = screen.getByRole( 'button', { name: 'Keep building' } );
		expect( cancelButton ).toHaveAttribute( 'aria-disabled', 'true' );

		await userEvent.click( cancelButton );
		fireEvent.keyDown( screen.getByRole( 'dialog' ), { key: 'Escape' } );
		await userEvent.click(
			document.querySelector( '.components-modal__screen-overlay' ) as HTMLElement
		);

		await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );
		expect( onCancel ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'dialog', { name: 'Confirm title' } ) ).toBeVisible();
	} );

	it( 'ignores a close that finishes animating after confirming started', async () => {
		const { onCancel, rerender } = renderModal();

		fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
		rerender( { isConfirming: true } );

		await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );
		expect( onCancel ).not.toHaveBeenCalled();
	} );
} );
