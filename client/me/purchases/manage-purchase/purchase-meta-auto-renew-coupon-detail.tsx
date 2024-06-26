import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import type { Purchase } from 'calypso/lib/purchases/types';

const RenewalSubtext = styled.div`
	margin-top: 1em;
`;

function PurchaseMetaAutoRenewCouponDetail( {
	purchase,
}: {
	purchase: Purchase;
} ): JSX.Element | null {
	const translate = useTranslate();

	if ( ! purchase.autoRenewCouponDiscountPercentage || ! purchase.autoRenewCouponCode ) {
		return null;
	}

	return (
		<RenewalSubtext>
			{ translate(
				'Coupon code "%(code)s" has been applied for the next renewal for a %(discount)d%% discount.',
				{
					args: {
						discount: purchase.autoRenewCouponDiscountPercentage,
						code: purchase.autoRenewCouponCode,
					},
				}
			) }
		</RenewalSubtext>
	);
}

export default PurchaseMetaAutoRenewCouponDetail;
