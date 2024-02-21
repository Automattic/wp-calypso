import { useTranslate } from 'i18n-calypso';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ReactNode } from 'react';

function PurchaseMetaAutoRenewCouponDetail( {
	purchase,
}: {
	purchase: Purchase;
} ): JSX.Element | null {
	const translate = useTranslate();

	if ( ! purchase.autoRenewCouponDiscount || ! purchase.autoRenewCouponCode ) {
		return null;
	}

	return (
		<RenewalSubtext
			text={ translate(
				'Your renewal will automatically apply coupon code "%(code)s" for %(discount)s%% discount.',
				{
					args: {
						discount: purchase.autoRenewCouponDiscount,
						code: purchase.autoRenewCouponCode,
					},
				}
			) }
		/>
	);
}

function RenewalSubtext( { text }: { text: ReactNode } ): JSX.Element {
	return (
		<>
			<br /> <br /> <> { text } </>{ ' ' }
		</>
	);
}

export default PurchaseMetaAutoRenewCouponDetail;
