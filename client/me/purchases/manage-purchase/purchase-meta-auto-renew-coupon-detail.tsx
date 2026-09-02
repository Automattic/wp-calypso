import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import type { Purchase } from '@automattic/api-core';
import type { JSX } from 'react';

const RenewalSubtext = styled.div`
	margin-top: 1em;
`;

function PurchaseMetaAutoRenewCouponDetail( {
	purchase,
}: {
	purchase: Purchase;
} ): JSX.Element | null {
	const translate = useTranslate();

	if ( ! purchase.auto_renew_coupon_discount_percentage || ! purchase.auto_renew_coupon_code ) {
		return null;
	}

	return (
		<RenewalSubtext>
			{ translate(
				'Coupon code "%(code)s" has been applied for the next renewal for a %(discount)d%% discount.',
				{
					args: {
						discount: purchase.auto_renew_coupon_discount_percentage,
						code: purchase.auto_renew_coupon_code,
					},
				}
			) }
		</RenewalSubtext>
	);
}

export default PurchaseMetaAutoRenewCouponDetail;
