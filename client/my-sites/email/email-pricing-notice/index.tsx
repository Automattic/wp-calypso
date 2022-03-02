import { translate as originalTranslate, useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { SiteDomain } from 'calypso/state/sites/domains/types';
import type { TranslateResult } from 'i18n-calypso';

const doesAdditionalPriceMatchStandardPrice = (
	domain: ResponseDomain | SiteDomain | null,
	mailProduct: ProductListItem,
	purchaseCost: EmailCost | null
): boolean => {
	if ( ! domain ) {
		return true;
	}

	if ( ! purchaseCost ) {
		return true;
	}

	return (
		purchaseCost.amount === mailProduct.cost && purchaseCost.currency === mailProduct.currency_code
	);
};

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
	return mailboxPurchaseCost.amount === 0
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
	mailboxPurchaseCost,
	mailboxRenewalCost,
	translate,
}: {
	mailboxPurchaseCost: EmailCost | null;
	mailboxRenewalCost: EmailCost | null;
	translate: typeof originalTranslate;
} ): TranslateResult {
	if ( mailboxPurchaseCost === null || mailboxRenewalCost === null ) {
		return '';
	}

	// We don't need any explanation of the price at this point, because we have already handled it previously.
	if ( mailboxPurchaseCost.amount === 0 ) {
		return '';
	}

	if ( mailboxPurchaseCost.amount < mailboxRenewalCost.amount ) {
		return translate(
			'This is less than the regular price because you are only charged for the remainder of the current year.'
		);
	}

	return translate(
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
	domain: ResponseDomain | SiteDomain | null;
	expiryDate: string | null;
	mailboxPurchaseCost: EmailCost | null;
	mailboxRenewalCost: EmailCost | null;
	product: ProductListItem;
}

const EmailPricingNotice = ( {
	domain,
	expiryDate,
	mailboxPurchaseCost,
	mailboxRenewalCost,
	product,
}: MailboxPricingNoticeProps ): JSX.Element | null => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	if ( doesAdditionalPriceMatchStandardPrice( domain, product, mailboxPurchaseCost ) ) {
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

		return (
			<Notice icon="info-outline" showDismiss={ false } status="is-success">
				{ translate(
					'You can purchase new mailboxes at the regular price of {{strong}}%(price)s{{/strong}} per mailbox per year.',
					translateArgs
				) }
			</Notice>
		);
	}

	const priceMessage = getPriceMessage( { mailboxPurchaseCost, translate } );
	const priceMessageExplanation = getPriceMessageExplanation( {
		mailboxPurchaseCost,
		mailboxRenewalCost,
		translate,
	} );
	const priceMessageRenewal = getPriceMessageRenewal( {
		expiryDate: moment( expiryDate ).format( 'LL' ),
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
