/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { render } from '../../../../test-utils';
import { UpcomingRenewalsDialog } from '../upcoming-renewals-dialog';
import type { Purchase } from '@automattic/api-core';

const purchase = ( ID: number ): Purchase =>
	( {
		ID,
		product_name: `Plan ${ ID }`,
		product_slug: 'personal-bundle',
		is_plan: true,
		currency_code: 'USD',
		amount: 100,
		expiry_date: '2027-01-01',
		expiry_status: 'manual-renew',
	} ) as Purchase;

function Harness( { onConfirm }: { onConfirm: ( purchases: Purchase[] ) => void } ) {
	const [ purchases, setPurchases ] = useState( [ purchase( 1 ), purchase( 2 ) ] );
	const [ isOpen, setIsOpen ] = useState( true );
	return (
		<>
			{ isOpen && (
				<UpcomingRenewalsDialog
					siteDomain="example.com"
					purchases={ purchases }
					onClose={ () => setIsOpen( false ) }
					onConfirm={ ( selected ) => {
						onConfirm( selected );
						setIsOpen( false );
					} }
				/>
			) }
			<button onClick={ () => setIsOpen( true ) }>Open renewals</button>
			<button onClick={ () => setPurchases( purchases.map( ( p ) => ( { ...p, amount: 200 } ) ) ) }>
				Refresh purchases
			</button>
			<button onClick={ () => setPurchases( [ purchase( 1 ), purchase( 3 ) ] ) }>
				Replace second purchase
			</button>
		</>
	);
}

test( 'keeps an unchecked renewal excluded when purchase details refresh', async () => {
	const user = userEvent.setup();
	const onConfirm = jest.fn();
	render( <Harness onConfirm={ onConfirm } /> );
	await user.click( await screen.findByRole( 'checkbox', { name: 'Plan 1' } ) );
	await user.click( screen.getByText( 'Refresh purchases' ) );
	expect( screen.getByRole( 'checkbox', { name: 'Plan 1' } ) ).not.toBeChecked();
	await user.click( screen.getByRole( 'button', { name: 'Renew now' } ) );
	expect( onConfirm ).toHaveBeenCalledWith( [ { ...purchase( 2 ), amount: 200 } ] );
} );

test( 'includes newly available purchases without restoring deselected ones or submitting removed ones', async () => {
	const user = userEvent.setup();
	const onConfirm = jest.fn();
	render( <Harness onConfirm={ onConfirm } /> );
	await user.click( await screen.findByRole( 'checkbox', { name: 'Plan 1' } ) );
	await user.click( screen.getByText( 'Replace second purchase' ) );
	expect( screen.getByRole( 'checkbox', { name: 'Plan 1' } ) ).not.toBeChecked();
	expect( screen.getByRole( 'checkbox', { name: 'Plan 3' } ) ).toBeChecked();
	await user.click( screen.getByRole( 'button', { name: 'Renew now' } ) );
	expect( onConfirm ).toHaveBeenCalledWith( [ purchase( 3 ) ] );
} );

test( 'keeps all exclusions through refresh and selects everything again after reopening', async () => {
	const user = userEvent.setup();
	const onConfirm = jest.fn();
	render( <Harness onConfirm={ onConfirm } /> );
	await user.click( await screen.findByRole( 'checkbox', { name: 'Plan 1' } ) );
	await user.click( screen.getByRole( 'checkbox', { name: 'Plan 2' } ) );
	await user.click( screen.getByText( 'Refresh purchases' ) );
	await user.click( screen.getByRole( 'button', { name: 'Renew now' } ) );
	expect( onConfirm ).toHaveBeenCalledWith( [] );
	await user.click( screen.getByText( 'Open renewals' ) );
	expect( await screen.findByRole( 'checkbox', { name: 'Plan 1' } ) ).toBeChecked();
	expect( screen.getByRole( 'checkbox', { name: 'Plan 2' } ) ).toBeChecked();
} );
