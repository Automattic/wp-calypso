import { Domain, EmailCost, Product } from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import { Notice } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { add } from 'date-fns';
import { useLocale } from '../../../app/locale';
import { Text } from '../../../components/text';
import { formatDate } from '../../../utils/datetime';
import { getTitanExpiryDate } from '../../utils/get-titan-expiry-date';
import { isDomainEligibleForTitanIntroductoryOffer } from '../../utils/is-domain-eligible-for-titan-introductory-offer';
import { isMonthlyEmailProduct } from '../../utils/is-monthly-email-product';
import { isUserOnTitanFreeTrial } from '../../utils/is-user-on-titan-free-trial';

const doesAdditionalPriceMatchStandardPrice = (
	mailProduct: Product,
	purchaseCost: EmailCost
): boolean => {
	return (
		purchaseCost.amount === mailProduct.cost && purchaseCost.currency === mailProduct.currency_code
	);
};

function getPriceMessage( domain?: Domain ) {
	if ( ! domain?.titan_mail_subscription?.purchase_cost_per_mailbox ) {
		return '';
	}

	return isUserOnTitanFreeTrial( domain )
		? __( 'You can add new mailboxes for free until the end of your trial period.' )
		: createInterpolateElement(
				sprintf(
					// Translators: %(proratedPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50).
					__(
						'You can purchase new mailboxes at the prorated price of <strong>%(proratedPrice)s</strong> per mailbox.'
					),
					{ proratedPrice: domain.titan_mail_subscription.purchase_cost_per_mailbox.text }
				),

				{
					strong: <strong />,
				}
		  );
}

function getPriceMessageExplanation( {
	domain,
	hasGoogleWorkspaceOffer = false,
	isMonthlyBilling,
	mailboxPurchaseCost,
	mailboxRenewalCost,
}: {
	domain?: Domain;
	hasGoogleWorkspaceOffer?: boolean;
	isMonthlyBilling: boolean;
	mailboxPurchaseCost?: EmailCost;
	mailboxRenewalCost?: EmailCost;
} ) {
	if ( ! mailboxPurchaseCost || ! mailboxRenewalCost ) {
		return '';
	}

	// We don't need any explanation of the price at this point, because we have already handled it previously.
	if ( domain && isUserOnTitanFreeTrial( domain ) ) {
		return '';
	}

	if ( mailboxPurchaseCost.amount < mailboxRenewalCost.amount ) {
		if ( hasGoogleWorkspaceOffer ) {
			return isMonthlyBilling
				? __(
						'This is less than the first year discounted price because you are only charged for the remainder of the current month.'
				  )
				: __(
						'This is less than the first year discounted price because you are only charged for the remainder of the current year.'
				  );
		}

		return isMonthlyBilling
			? __(
					'This is less than the regular price because you are only charged for the remainder of the current month.'
			  )
			: __(
					'This is less than the regular price because you are only charged for the remainder of the current year.'
			  );
	}

	return isMonthlyBilling
		? __(
				'This is more than the regular price because you are charged for the remainder of the current month plus any additional month until renewal.'
		  )
		: __(
				'This is more than the regular price because you are charged for the remainder of the current year plus any additional year until renewal.'
		  );
}

function getPriceMessageRenewal( {
	expiryDate,
	mailboxRenewalCost,
}: {
	expiryDate: string;
	mailboxRenewalCost?: EmailCost;
} ) {
	if ( ! mailboxRenewalCost ) {
		return '';
	}

	return createInterpolateElement(
		sprintf(
			// Translators: %(fullPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50), %(expiryDate)s is a localized date (e.g. February 17, 2021).
			__(
				'All of your mailboxes are due to renew at the regular price of <strong>%(fullPrice)s</strong> per mailbox when your subscription renews on <strong>%(expiryDate)s</strong>.'
			),
			{
				fullPrice: mailboxRenewalCost.text,
				expiryDate: expiryDate,
			}
		),
		{
			strong: <strong />,
		}
	);
}

export const PricingNotice = ( {
	domain,
	product,
	showEmailPurchaseDisabledMessage,
}: {
	domain: Domain;
	product: Product;
	showEmailPurchaseDisabledMessage: boolean;
} ) => {
	const locale = useLocale();

	const purchaseCost = domain.titan_mail_subscription?.purchase_cost_per_mailbox;
	const renewalCost = domain.titan_mail_subscription?.renewal_cost_per_mailbox;

	if ( purchaseCost && doesAdditionalPriceMatchStandardPrice( product, purchaseCost ) ) {
		const placeholders = { price: purchaseCost.text };

		return (
			<Text as="p">
				{ createInterpolateElement(
					isMonthlyEmailProduct( product )
						? sprintf(
								// Translators: %(price)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50).
								__(
									'You can purchase new mailboxes at the regular price of <strong>%(price)s</strong> per mailbox per month.'
								),
								placeholders
						  )
						: sprintf(
								// Translators: %(price)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50).
								__(
									'You can purchase new mailboxes at the regular price of <strong>%(price)s</strong> per mailbox per year.'
								),
								placeholders
						  ),
					{
						strong: <strong />,
					}
				) }
			</Text>
		);
	}

	const priceMessage = getPriceMessage( domain );
	const priceMessageExplanation = getPriceMessageExplanation( {
		domain,
		isMonthlyBilling: isMonthlyEmailProduct( product ),
		mailboxPurchaseCost: purchaseCost,
		mailboxRenewalCost: renewalCost,
	} );
	const nextExpiryDate = formatDate(
		new Date( ( domain && getTitanExpiryDate( domain ) ) || '' ),
		locale,
		{
			dateStyle: 'long',
		}
	);
	const priceMessageRenewal = getPriceMessageRenewal( {
		expiryDate: nextExpiryDate,
		mailboxRenewalCost: renewalCost,
	} );

	let endDate = new Date();
	const hasOffer = isDomainEligibleForTitanIntroductoryOffer( { domain, product } );
	if ( hasOffer ) {
		const count = product?.introductory_offer?.interval_count;
		const unit = product?.introductory_offer?.interval_unit;
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

	let message;
	if ( hasOffer && ! showEmailPurchaseDisabledMessage ) {
		if ( isMonthlyEmailProduct( product ) ) {
			message = sprintf(
				// Translators: %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year"), %(endDate)s is the date the trial ends (e.g. "October 26, 2005").
				__(
					'Try free today - renews at the regular price of %(cost)s per %(termLocalized)s (excl. taxes) when your free trial ends on %(endDate)s.'
				),
				{
					cost: product.combined_cost_display,
					termLocalized: product.product_term_localized,
					endDate: formatDate( endDate, locale, { dateStyle: 'long' } ),
				}
			);
		} else {
			message = sprintf(
				// Translators: %(firstRenewalPrice)s is the price the product gets renewed at, %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year"), %(endDate)s is the date the trial ends (e.g. "October 26, 2005").
				__(
					'Try free today - first renewal at %(firstRenewalPrice)s (excl. taxes) after your free trial ends on %(endDate)s, regular price %(cost)s per %(termLocalized)s (excl. taxes).'
				),
				{
					firstRenewalPrice: formatCurrency(
						( ( product.cost ?? 0 ) * 9 ) / 12,
						product.currency_code,
						{ stripZeros: true }
					),
					cost: product.combined_cost_display,
					termLocalized: product.product_term_localized,
					endDate: formatDate( endDate, locale, { dateStyle: 'long' } ),
				}
			);
		}
	} else {
		message = sprintf(
			// Translators: %(cost)s is the displayed cost, %(termLocalized)s is the localized term (e.g. "year").
			__(
				'Add as many mailboxes as you need. Each one has a price of %(cost)s per %(termLocalized)s (excl. taxes).'
			),
			{
				cost: product.combined_cost_display,
				termLocalized: product.product_term_localized,
			}
		);
	}

	return (
		<>
			{ priceMessage ? (
				<Notice status="info" isDismissible={ false }>
					{ priceMessage } { priceMessageExplanation } { priceMessageRenewal }
				</Notice>
			) : (
				<Text size={ 16 } as="p">
					{ message }
				</Text>
			) }
		</>
	);
};
