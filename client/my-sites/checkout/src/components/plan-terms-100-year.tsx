import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { has100YearPlan } from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from './checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

export function PlanTerms100Year( { cart }: { cart: ResponseCart } ) {
	const translate = useTranslate();

	if ( ! has100YearPlan( cart ) ) {
		return null;
	}

	return (
		<CheckoutTermsItem>
			{ translate(
				'You acknowledge that you have read and understand the details about the %(planName)s listed {{supportLink}}here{{/supportLink}}, including feature changes that could occur during the life of your plan.',
				{
					components: {
						supportLink: (
							<a
								href={ localizeUrl( 'https://wordpress.com/support/plan-features/100-year-plan/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
					args: {
						planName: getPlan( PLAN_100_YEARS )?.getTitle() || '',
					},
				}
			) }
		</CheckoutTermsItem>
	);
}
