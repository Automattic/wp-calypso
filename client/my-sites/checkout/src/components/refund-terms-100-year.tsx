import { formatCurrency } from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { has100YearPlan } from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from './checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

export function RefundTerms100Year( { cart }: { cart: ResponseCart } ) {
	const translate = useTranslate();

	if ( ! has100YearPlan( cart ) ) {
		return null;
	}

	return (
		<CheckoutTermsItem>
			{ translate(
				'You will be charged %(cost)s and understand that {{supportLink}}refunds{{/supportLink}} are limited to %(refundPeriodDays)d days after purchase.',
				{
					components: {
						supportLink: (
							<a
								href={ localizeUrl(
									'https://wordpress.com/support/manage-purchases/#refund-policy'
								) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
					args: {
						cost: formatCurrency( cart.total_cost_integer, cart.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ),
						refundPeriodDays: 120,
					},
				}
			) }
		</CheckoutTermsItem>
	);
}
