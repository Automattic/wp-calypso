import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { has100YearDomain, has100YearPlan } from 'calypso/lib/cart-values/cart-items';
import CheckoutTermsItem from './checkout-terms-item';
import type { ResponseCart } from '@automattic/shopping-cart';

type TermsType = 'domain' | 'plan';

export function Terms100Year( { cart, type }: { cart: ResponseCart; type: TermsType } ) {
	const translate = useTranslate();

	const shouldShow = type === 'domain' ? has100YearDomain( cart ) : has100YearPlan( cart );

	if ( ! shouldShow ) {
		return null;
	}

	const planName = type === 'plan' ? getPlan( PLAN_100_YEARS )?.getTitle() || '' : '';

	return (
		<CheckoutTermsItem>
			{ type === 'domain'
				? translate(
						'You acknowledge that you have read and understand {{supportLink}}these details about the 100-Year Domain{{/supportLink}}, including feature changes that could occur during the life of your subscription.',
						{
							components: {
								supportLink: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/plan-features/100-year-plan/#100-year-domain-registration'
										) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						}
				  )
				: translate(
						'You acknowledge that you have read and understand {{supportLink}}these details about the %(planName)s{{/supportLink}}, including feature changes that could occur during the life of your plan.',
						{
							components: {
								supportLink: (
									<a
										href={ localizeUrl(
											'https://wordpress.com/support/plan-features/100-year-plan/'
										) }
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
							args: {
								planName,
							},
						}
				  ) }
		</CheckoutTermsItem>
	);
}

export function DomainTerms100Year( { cart }: { cart: ResponseCart } ) {
	return <Terms100Year cart={ cart } type="domain" />;
}

export function PlanTerms100Year( { cart }: { cart: ResponseCart } ) {
	return <Terms100Year cart={ cart } type="plan" />;
}
