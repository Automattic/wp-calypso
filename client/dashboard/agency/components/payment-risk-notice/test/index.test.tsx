/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import PaymentRiskNotice from '../index';
import type { Agency, AgencyPaymentNotice } from '@automattic/api-core';

const agencyWith = ( payment_notice: AgencyPaymentNotice | null ) =>
	( { id: 1, payment_notice } ) as Agency;

describe( '<PaymentRiskNotice>', () => {
	test( 'shows the copy and actions the backend sends', () => {
		render(
			<PaymentRiskNotice
				source="overview"
				agency={ agencyWith( {
					state: 'renewal_failure',
					severity: 'error',
					title: 'Action required: Payment failed',
					content: 'We couldn’t process payment for one or more of your subscriptions.',
					primary_action_label: 'Update your payment method',
					primary_action_url: 'https://wordpress.com/me/billing/purchases',
					secondary_action_label: 'View billing FAQ',
					secondary_action_url: 'https://agencieshelp.automattic.com/faq/',
				} ) }
			/>
		);

		expect( screen.getByText( 'Action required: Payment failed' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Update your payment method' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/me/billing/purchases'
		);
		expect( screen.getByRole( 'link', { name: 'View billing FAQ' } ) ).toHaveAttribute(
			'href',
			'https://agencieshelp.automattic.com/faq/'
		);
	} );

	test( 'falls back to the WordPress.com payment methods page when no action is sent', () => {
		render(
			<PaymentRiskNotice
				source="overview"
				agency={ agencyWith( { state: 'card_expiry', severity: 'warning' } ) }
			/>
		);

		expect( screen.getByRole( 'link', { name: 'Fix payment method' } ) ).toHaveAttribute(
			'href',
			expect.stringMatching( /\/me\/purchases\/payment-methods$/ )
		);
	} );

	test( 'offers no payment method link to someone who cannot manage it', () => {
		render(
			<PaymentRiskNotice
				source="overview"
				agency={ agencyWith( {
					state: 'card_expiry',
					severity: 'warning',
					can_current_user_manage_payment_method: false,
				} ) }
			/>
		);

		expect( screen.queryByRole( 'link', { name: 'Fix payment method' } ) ).not.toBeInTheDocument();
	} );
} );
