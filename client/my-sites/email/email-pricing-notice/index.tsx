import { isGoogleWorkspace } from '@automattic/calypso-products';
import { translate as originalTranslate, useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import { hasIntroductoryOffer } from 'calypso/lib/emails';
import { isUserOnTitanFreeTrial } from 'calypso/lib/titan';
import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { TranslateResult } from 'i18n-calypso';

const doesAdditionalPriceMatchStandardPrice = (
	mailProduct: ProductListItem,
	purchaseCost: EmailCost
): boolean => {
	return (
		purchaseCost.amount === mailProduct.cost && purchaseCost.currency === mailProduct.currency_code
	);
};

function getNoticeMessage(
	isMonthlyBilling: boolean,
	mailboxPurchaseCost: EmailCost | null,
	translate: typeof originalTranslate
): TranslateResult {
	const translateArgs = {
		args: {
			price: mailboxPurchaseCost?.text,
		},
		components: {
			strong: <strong />,
		},
		comment:
			'%(price)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50)',
	};

	return isMonthlyBilling
		? translate(
				'You can purchase new mailboxes at the regular price of {{strong}}%(price)s{{/strong}} per mailbox per month.',
				translateArgs
		  )
		: translate(
				'You can purchase new mailboxes at the regular price of {{strong}}%(price)s{{/strong}} per mailbox per year.',
				translateArgs
		  );
}

function getPriceMessage( {
	mailboxPurchaseCost,
	translate,
}: {
	mailboxPurchaseCost: EmailCost | null;
	translate: typeof originalTranslate;
} ): TranslateResult {
	if ( mailboxPurchaseCost === null ) {
		return '';
	}
	return isUserOnTitanFreeTrial( mailboxPurchaseCost )
		? translate( 'You can add new mailboxes for free until the end of your trial period.' )
		: translate(
				'You can purchase new mailboxes at the prorated price of {{strong}}%(proratedPrice)s{{/strong}} per mailbox.',
				{
					args: {
						proratedPrice: mailboxPurchaseCost.text,
					},
					components: {
						strong: <strong />,
					},
					comment:
						'%(proratedPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50)',
				}
		  );
}

function getPriceMessageExplanation( {
	hasGoogleWorkspaceOffer,
	isMonthlyBilling,
	mailboxPurchaseCost,
	mailboxRenewalCost,
	translate,
}: {
	hasGoogleWorkspaceOffer: boolean;
	isMonthlyBilling: boolean;
	mailboxPurchaseCost: EmailCost | null;
	mailboxRenewalCost: EmailCost | null;
	translate: typeof originalTranslate;
} ): TranslateResult {
	if ( mailboxPurchaseCost === null || mailboxRenewalCost === null ) {
		return '';
	}

	// We don't need any explanation of the price at this point, because we have already handled it previously.
	if ( isUserOnTitanFreeTrial( mailboxPurchaseCost ) ) {
		return '';
	}

	if ( mailboxPurchaseCost.amount < mailboxRenewalCost.amount ) {
		if ( hasGoogleWorkspaceOffer ) {
			return isMonthlyBilling
				? translate(
						'This is less than the first year discounted price because you are only charged for the remainder of the current month.'
				  )
				: translate(
						'This is less than the first year discounted price because you are only charged for the remainder of the current year.'
				  );
		}

		return isMonthlyBilling
			? translate(
					'This is less than the regular price because you are only charged for the remainder of the current month.'
			  )
			: translate(
					'This is less than the regular price because you are only charged for the remainder of the current year.'
			  );
	}

	return isMonthlyBilling
		? translate(
				'This is more than the regular price because you are charged for the remainder of the current month plus any additional month until renewal.'
		  )
		: translate(
				'This is more than the regular price because you are charged for the remainder of the current year plus any additional year until renewal.'
		  );
}

function getPriceMessageRenewal( {
	expiryDate,
	mailboxRenewalCost,
	translate,
}: {
	expiryDate: string;
	mailboxRenewalCost: EmailCost | null;
	translate: typeof originalTranslate;
} ): TranslateResult {
	if ( mailboxRenewalCost === null ) {
		return '';
	}

	return translate(
		'All of your mailboxes are due to renew at the regular price of {{strong}}%(fullPrice)s{{/strong}} per mailbox when your subscription renews on {{strong}}%(expiryDate)s{{/strong}}.',
		{
			args: {
				fullPrice: mailboxRenewalCost.text,
				expiryDate: expiryDate,
			},
			components: {
				strong: <strong />,
			},
			comment:
				'%(fullPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50), ' +
				'%(expiryDate)s is a localized date (e.g. February 17, 2021)',
		}
	);
}

interface MailboxPricingNoticeProps {
	domain: ResponseDomain | null;
	expiryDate: string | null;
	isMonthlyBilling?: boolean;
	mailboxPurchaseCost: EmailCost | null;
	mailboxRenewalCost: EmailCost | null;
	product: ProductListItem | null;
}

const EmailPricingNotice = ( {
	domain,
	expiryDate,
	isMonthlyBilling = false,
	mailboxPurchaseCost,
	mailboxRenewalCost,
	product,
}: MailboxPricingNoticeProps ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	if ( ! domain || ! mailboxPurchaseCost || ! product ) {
		return null;
	}

	if ( doesAdditionalPriceMatchStandardPrice( product, mailboxPurchaseCost ) ) {
		return (
			<Notice icon="info-outline" showDismiss={ false } status="is-success">
				{ getNoticeMessage( isMonthlyBilling, mailboxPurchaseCost, translate ) }
			</Notice>
		);
	}

	const hasGoogleWorkspaceOffer = isGoogleWorkspace( product ) && hasIntroductoryOffer( product );

	const priceMessage = getPriceMessage( {
		mailboxPurchaseCost,
		translate,
	} );
	const priceMessageExplanation = getPriceMessageExplanation( {
		hasGoogleWorkspaceOffer,
		isMonthlyBilling,
		mailboxPurchaseCost,
		mailboxRenewalCost,
		translate,
	} );

	const nextExpiryDate =
		hasGoogleWorkspaceOffer && isMonthlyBilling
			? moment( expiryDate )
					.add( product?.introductory_offer?.transition_after_renewal_count, 'M' )
					.format( 'LL' )
			: moment( expiryDate ).format( 'LL' );

	const priceMessageRenewal = getPriceMessageRenewal( {
		expiryDate: nextExpiryDate,
		mailboxRenewalCost,
		translate,
	} );

	return (
		<Notice icon="info-outline" showDismiss={ false } status="is-success">
			<>
				{ priceMessage } { priceMessageExplanation } { priceMessageRenewal }
			</>
		</Notice>
	);
};

export default EmailPricingNotice;
