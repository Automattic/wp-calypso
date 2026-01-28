import { Domain, Product } from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import { __, sprintf } from '@wordpress/i18n';
import { add } from 'date-fns';
import { formatDate } from '../../utils/datetime';
import { MailboxProvider } from '../types';
import { doesAdditionalPriceMatchStandardPrice } from './does-additional-price-match-standard-price';
import { getEmailSubscription } from './get-email-subscription';
import { getExpiryDate } from './get-expiry-date';
import { getProductProvider } from './get-product-provider';
import { isEligibleForIntroductoryOffer } from './is-eligible-for-introductory-offer';
import { isMonthlyEmailProduct } from './is-monthly-email-product';
import { isUserOnFreeTrial } from './is-user-on-free-trial';

export const getMailboxCost = ( {
	domain,
	product,
	showEmailPurchaseDisabledMessage,
	locale,
}: {
	domain: Domain;
	product: Product;
	showEmailPurchaseDisabledMessage: boolean;
	locale: string;
} ): {
	amount: number;
	currency: string;
	message: string;
	notice?: boolean;
} => {
	const provider = getProductProvider( product );
	const emailSubscription = getEmailSubscription( { domain, product } );
	const isMonthlyBilling = isMonthlyEmailProduct( product );
	const hasOffer = isEligibleForIntroductoryOffer( { emailSubscription, product } );

	const purchaseCost = emailSubscription?.purchase_cost_per_mailbox;
	const renewalCost = emailSubscription?.renewal_cost_per_mailbox;

	if ( purchaseCost ) {
		if ( doesAdditionalPriceMatchStandardPrice( product, purchaseCost ) ) {
			const message = isMonthlyBilling
				? // Translators: %(price)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50).
				  __(
						'You can purchase new mailboxes at the regular price of <strong>%(price)s</strong> per mailbox per month.'
				  )
				: // Translators: %(price)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50).
				  __(
						'You can purchase new mailboxes at the regular price of <strong>%(price)s</strong> per mailbox per year.'
				  );

			return {
				amount: purchaseCost.amount,
				currency: purchaseCost.currency,
				message: sprintf( message, {
					price: purchaseCost.text,
				} ),
			};
		}

		if ( isUserOnFreeTrial( emailSubscription ) ) {
			return {
				amount: 0,
				currency: purchaseCost.currency,
				message: __( 'You can add new mailboxes for free until the end of your trial period.' ),
			};
		}

		let message = sprintf(
			// Translators: %(proratedPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50).
			__(
				'You can purchase new mailboxes at the prorated price of <strong>%(proratedPrice)s</strong> per mailbox.'
			),
			{ proratedPrice: purchaseCost.text }
		);

		if ( renewalCost ) {
			message += ' ';
			if ( purchaseCost.amount < renewalCost.amount ) {
				if ( provider === MailboxProvider.Google && hasOffer ) {
					message += isMonthlyBilling
						? __(
								'This is less than the first year discounted price because you are only charged for the remainder of the current month.'
						  )
						: __(
								'This is less than the first year discounted price because you are only charged for the remainder of the current year.'
						  );
				} else {
					message += isMonthlyBilling
						? __(
								'This is less than the regular price because you are only charged for the remainder of the current month.'
						  )
						: __(
								'This is less than the regular price because you are only charged for the remainder of the current year.'
						  );
				}
			} else {
				message += isMonthlyBilling
					? __(
							'This is more than the regular price because you are charged for the remainder of the current month plus any additional month until renewal.'
					  )
					: __(
							'This is more than the regular price because you are charged for the remainder of the current year plus any additional year until renewal.'
					  );
			}

			const nextExpiryDate = formatDate(
				new Date( getExpiryDate( emailSubscription ) || '' ),
				locale,
				{
					dateStyle: 'long',
				}
			);
			message +=
				' ' +
				sprintf(
					// Translators: %(fullPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50), %(expiryDate)s is a localized date (e.g. February 17, 2021).
					__(
						'All of your mailboxes are due to renew at the regular price of <strong>%(fullPrice)s</strong> per mailbox when your subscription renews on <strong>%(expiryDate)s</strong>.'
					),
					{
						fullPrice: renewalCost.text,
						expiryDate: nextExpiryDate,
					}
				);
		}

		return {
			amount: purchaseCost.amount,
			currency: purchaseCost.currency,
			message,
			notice: true,
		};
	}

	let endDate = new Date();
	if ( hasOffer ) {
		const count = product.introductory_offer?.interval_count;
		const unit = product.introductory_offer?.interval_unit;
		switch ( unit ) {
			case 'year':
				endDate = add( new Date(), { years: count } );
				break;
			case 'month':
				endDate = add( new Date(), { months: count } );
				break;
			case 'week':
				endDate = add( new Date(), { weeks: count } );
				break;
			case 'day':
				endDate = add( new Date(), { days: count } );
				break;
		}
	}

	if ( hasOffer && ! showEmailPurchaseDisabledMessage ) {
		const placeholders = {
			cost: product.combined_cost_display,
			termLocalized: product.product_term_localized,
			endDate: formatDate( endDate, locale, { dateStyle: 'long' } ),
		};
		const message = isMonthlyBilling
			? // Translators: %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year"), %(endDate)s is the date the trial ends (e.g. "October 26, 2005").
			  __(
					'Try free today - renews at the regular price of %(cost)s per %(termLocalized)s (excl. taxes) when your free trial ends on %(endDate)s.'
			  )
			: // Translators: %(firstRenewalPrice)s is the price the product gets renewed at, %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year"), %(endDate)s is the date the trial ends (e.g. "October 26, 2005").
			  __(
					'Try free today - first renewal at %(firstRenewalPrice)s (excl. taxes) after your free trial ends on %(endDate)s, regular price %(cost)s per %(termLocalized)s (excl. taxes).'
			  );
		const renewalMonths = product.introductory_offer?.interval_unit === 'year' ? 12 : 9;
		return {
			amount: 0,
			currency: product.currency_code,
			message: sprintf( message, {
				...placeholders,
				firstRenewalPrice: formatCurrency(
					( ( product.cost ?? 0 ) * renewalMonths ) / 12,
					product.currency_code,
					{ stripZeros: true }
				),
			} ),
		};
	}

	const message =
		// Translators: %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year").
		__(
			'Add as many mailboxes as you need. Each one has a price of %(cost)s per %(termLocalized)s (excl. taxes).'
		);
	return {
		amount: product.cost,
		currency: product.currency_code,
		message: sprintf( message, {
			cost: product.combined_cost_display,
			termLocalized: product.product_term_localized,
		} ),
	};
};
