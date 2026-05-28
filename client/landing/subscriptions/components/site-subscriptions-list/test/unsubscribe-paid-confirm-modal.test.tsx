/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import UnsubscribePaidConfirmModal from '../unsubscribe-paid-confirm-modal';

describe( 'UnsubscribePaidConfirmModal', () => {
	const defaultProps = {
		isVisible: true,
		siteName: 'My Newsletter',
		onCancel: jest.fn(),
		onConfirm: jest.fn(),
	};

	beforeEach( () => {
		defaultProps.onCancel.mockClear();
		defaultProps.onConfirm.mockClear();
	} );

	it( 'renders nothing when not visible', () => {
		renderWithProvider( <UnsubscribePaidConfirmModal { ...defaultProps } isVisible={ false } /> );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the site name in the title and body', () => {
		renderWithProvider( <UnsubscribePaidConfirmModal { ...defaultProps } /> );
		expect(
			screen.getByRole( 'dialog', { name: /Unsubscribe from My Newsletter/ } )
		).toBeVisible();
		expect( screen.getByText( /My Newsletter emails/ ) ).toBeVisible();
	} );

	it( 'includes a link to manage the subscription that opens in a new tab', () => {
		renderWithProvider( <UnsubscribePaidConfirmModal { ...defaultProps } /> );
		const manageLink = screen.getByRole( 'link', { name: /manage your subscription/i } );
		expect( manageLink ).toHaveAttribute( 'href', '/me/purchases' );
		expect( manageLink ).toHaveAttribute( 'target', '_blank' );
		expect( manageLink ).toHaveAttribute( 'rel', expect.stringContaining( 'noopener' ) );
	} );

	it( 'calls onCancel when the Cancel button is clicked', async () => {
		renderWithProvider( <UnsubscribePaidConfirmModal { ...defaultProps } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
		expect( defaultProps.onCancel ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.onConfirm ).not.toHaveBeenCalled();
	} );

	it( 'calls onConfirm when the Unsubscribe button is clicked', async () => {
		renderWithProvider( <UnsubscribePaidConfirmModal { ...defaultProps } /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Unsubscribe' } ) );
		expect( defaultProps.onConfirm ).toHaveBeenCalledTimes( 1 );
		expect( defaultProps.onCancel ).not.toHaveBeenCalled();
	} );
} );
