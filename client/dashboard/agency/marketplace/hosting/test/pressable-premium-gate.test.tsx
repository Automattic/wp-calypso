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

const mockScheduleCall = jest.fn();

jest.mock( '../../../tiers/use-schedule-call', () => ( {
	useScheduleCall: () => ( { scheduleCall: mockScheduleCall, isLoading: false } ),
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
		mockScheduleCall.mockClear();
	} );

	test( 'names the plan and explains that Premium plans are referred', () => {
		renderGate();

		expect( screen.getByRole( 'heading', { name: 'Currently selected' } ) ).toBeVisible();
		expect( screen.getByText( 'Pressable Premium 3' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Premium plans are sold through referrals. Turn on Refer products to refer this plan to a client and earn 20% commission on every payment.'
			)
		).toBeVisible();
	} );

	test( 'the toggle switches the marketplace to referral mode', async () => {
		const { recordTracksEvent } = renderGate();

		const toggle = screen.getByRole( 'checkbox', { name: 'Refer products' } );
		expect( toggle ).not.toBeChecked();
		await userEvent.click( toggle );

		expect( sessionStorage.getItem( 'marketplace-type' ) ).toBe( 'referral' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_hosting_pressable_premium_refer_now_click'
		);
	} );

	test( 'the toggle is disabled until the agency is approved', () => {
		renderGate( 'pending' );

		expect( screen.getByRole( 'checkbox', { name: 'Refer products' } ) ).toBeDisabled();
	} );

	test( 'Talk to us schedules a call', async () => {
		const { recordTracksEvent } = renderGate();

		await userEvent.click( screen.getByRole( 'button', { name: /Talk to us/ } ) );

		expect( mockScheduleCall ).toHaveBeenCalled();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_hosting_pressable_premium_talk_to_us_click'
		);
	} );
} );
