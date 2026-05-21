/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import RefundEligibilityNotice from '../refund-eligibility-notice';
import type { Purchase } from '@automattic/api-core';

function makeRefundablePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 123,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		refund_integer: 9600,
		total_refund_integer: 9600,
		total_refund_currency: 'USD',
		refund_amount: 96,
		...overrides,
	} as Purchase;
}

describe( '<RefundEligibilityNotice />', () => {
	test( 'confirmed mode renders refund copy without an inline link', () => {
		render( <RefundEligibilityNotice purchase={ makeRefundablePurchase() } /> );

		expect(
			screen.getByText( /You’ll receive a \$96\.00 refund when you remove your plan\./ )
		).toBeVisible();
		expect( screen.queryByRole( 'link', { name: /remove plan and claim refund/i } ) ).toBeNull();
	} );

	test( 'refund-eligibility mode renders promo copy and a link to ?intent=remove', () => {
		render(
			<RefundEligibilityNotice mode="refund-eligibility" purchase={ makeRefundablePurchase() } />
		);

		expect(
			screen.getByText( /You’re eligible for a \$96\.00 refund if you remove your plan now\./ )
		).toBeVisible();
		const link = screen.getByRole( 'link', { name: /remove plan and claim refund/i } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', expect.stringContaining( 'intent=remove' ) );
	} );

	test( 'returns null when no refund is available', () => {
		const { container } = render(
			<RefundEligibilityNotice
				mode="refund-eligibility"
				purchase={ makeRefundablePurchase( {
					refund_integer: 0,
					total_refund_integer: 0,
					refund_amount: 0,
				} ) }
			/>
		);
		expect( container ).toBeEmptyDOMElement();
	} );
} );
