/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import { TitanPlanTier } from '../../../types';
import { TitanDowngradeModal } from '../titan-downgrade-modal';

const pendingDowngrade = { tier: TitanPlanTier.Pro, toProductId: 400 };

function renderModal( props: Partial< React.ComponentProps< typeof TitanDowngradeModal > > = {} ) {
	const onConfirm = jest.fn();
	const result = render(
		<TitanDowngradeModal
			pendingDowngrade={ pendingDowngrade }
			currentTier={ TitanPlanTier.Premium }
			mode="delayed"
			refundAmount={ 0 }
			currencyCode="USD"
			purchaseId={ 29102774 }
			isRechargeable
			isBusy={ false }
			onCancel={ jest.fn() }
			onConfirm={ onConfirm }
			{ ...props }
		/>
	);
	return { ...result, onConfirm };
}

describe( '<TitanDowngradeModal>', () => {
	test( 'schedules the change at renewal and promises no refund', () => {
		renderModal( { renewDate: '2026-10-01T00:00:00+00:00' } );

		expect( screen.getByText( /at your next renewal on October 1, 2026/ ) ).toBeVisible();
		expect( screen.getByText( /no refund or credit is issued/ ) ).toBeVisible();
	} );

	test( 'states the refund when the change happens instantly', () => {
		renderModal( { mode: 'instant', refundAmount: 18 } );

		expect( screen.getByText( /right away, and you will be refunded \$18/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Change plan and refund $18' } ) ).toBeEnabled();
	} );

	// The server rejects the delayed flow with `no_payment_method`, so the modal
	// has to block before the customer confirms into that error.
	test( 'blocks a scheduled change when no payment method can be charged', async () => {
		const { onConfirm } = renderModal( { isRechargeable: false } );

		expect( screen.getByText( /a payment method is required/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Add a payment method' } ) ).toBeVisible();

		const confirmButton = screen.getByRole( 'button', { name: 'Change plan' } );
		expect( confirmButton ).toBeDisabled();

		await userEvent.click( confirmButton );
		expect( onConfirm ).not.toHaveBeenCalled();
	} );

	// An instant downgrade only issues a refund, so it never needs one.
	test( 'does not require a payment method for an instant change', () => {
		renderModal( { mode: 'instant', isRechargeable: false } );

		expect( screen.queryByText( /a payment method is required/ ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Change plan' } ) ).toBeEnabled();
	} );

	test( 'renders nothing until a tier is picked', () => {
		renderModal( { pendingDowngrade: null } );

		expect( screen.queryByRole( 'button', { name: 'Change plan' } ) ).not.toBeInTheDocument();
	} );
} );
