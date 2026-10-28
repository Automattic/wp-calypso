/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { activeAgencyQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import PressablePremiumGate from '../pressable-premium-gate';
import type { Agency } from '@automattic/api-core';

jest.mock( '../../../tiers/use-schedule-call', () => ( {
	useScheduleCall: () => ( { scheduleCall: jest.fn(), isLoading: false } ),
} ) );

function renderGate( approvalStatus: Agency[ 'approval_status' ] = 'approved' ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 1,
		approval_status: approvalStatus,
	} as Agency );
	return render( <PressablePremiumGate label="Pressable Premium 3" />, { queryClient } );
}

describe( '<PressablePremiumGate>', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	test( 'the toggle switches the marketplace to referral mode', async () => {
		const { recordTracksEvent } = renderGate();

		const toggle = screen.getByRole( 'checkbox', { name: 'Refer to clients' } );
		expect( toggle ).not.toBeChecked();
		await userEvent.click( toggle );

		expect( sessionStorage.getItem( 'marketplace-type' ) ).toBe( 'referral' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_hosting_pressable_premium_refer_now_click'
		);
	} );

	test( 'the toggle opens the approval gate and stays off until the agency is approved', async () => {
		renderGate( 'pending' );

		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Refer to clients' } ) );

		expect(
			await screen.findByRole( 'dialog', { name: 'Referrals unlock once you’re approved' } )
		).toBeVisible();
		expect( sessionStorage.getItem( 'marketplace-type' ) ).toBeNull();
	} );

	test( 'lets an agency in review turn referral mode off', async () => {
		sessionStorage.setItem( 'marketplace-type', 'referral' );
		renderGate( 'pending' );

		const toggle = screen.getByRole( 'checkbox', { name: 'Refer to clients' } );
		expect( toggle ).toBeChecked();
		await userEvent.click( toggle );

		expect( sessionStorage.getItem( 'marketplace-type' ) ).toBe( 'regular' );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
