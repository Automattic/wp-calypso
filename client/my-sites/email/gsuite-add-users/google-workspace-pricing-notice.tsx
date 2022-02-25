import { translate as originalTranslate, useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import {
	getGSuiteExpiryDate,
	getGSuiteMailboxPurchaseCost,
	getGSuiteMailboxRenewalCost,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import type { EmailCost, ResponseDomain } from 'calypso/lib/domains/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import type { TranslateResult } from 'i18n-calypso';
import type { ReactElement } from 'react';

const doesAdditionalPriceMatchStandardPrice = (
	domain: ResponseDomain,
	googleMailProduct: ProductListItem
): boolean => {
	if ( ! domain || ! hasGSuiteWithUs( domain ) ) {
		return true;
	}
	const costPerAdditionalMailbox = getGSuiteMailboxPurchaseCost( domain );
	if ( ! costPerAdditionalMailbox ) {
		return true;
	}

	return (
		costPerAdditionalMailbox.amount === googleMailProduct.cost &&
		costPerAdditionalMailbox.currency === googleMailProduct.currency_code
	);
};

function getPriceMessage( {
	purchaseCost,
	translate,
}: {
	purchaseCost: EmailCost | null;
	translate: typeof originalTranslate;
} ): TranslateResult {
	if ( purchaseCost === null ) {
		return '';
	}
	return purchaseCost.amount === 0
		? translate( 'You can add new mailboxes for free until the end of your trial period.' )
		: translate(
				'You can purchase new mailboxes at the prorated price of {{strong}}%(proratedPrice)s{{/strong}} per mailbox.',
				{
					args: {
						proratedPrice: purchaseCost.text,
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
	purchaseCost,
	renewalCost,
	translate,
}: {
	purchaseCost: EmailCost | null;
	renewalCost: EmailCost | null;
	googleMailProduct: ProductListItem;
	translate: typeof originalTranslate;
} ): TranslateResult {
	if ( purchaseCost === null || renewalCost === null ) {
		return '';
	}

	// We don't need any explanation of the price at this point, because we have already handled it previously.
	if ( purchaseCost.amount === 0 ) {
		return '';
	}

	if ( purchaseCost.amount < renewalCost.amount ) {
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
	renewalCost,
	translate,
}: {
	expiryDate: string;
	renewalCost: EmailCost | null;
	translate: typeof originalTranslate;
} ): TranslateResult {
	if ( renewalCost === null ) {
		return '';
	}

	return translate(
		'All of your mailboxes are due to renew at the regular price of {{strong}}%(fullPrice)s{{/strong}} per mailbox when your subscription renews on {{strong}}%(expiryDate)s{{/strong}}.',
		{
			args: {
				fullPrice: renewalCost.text,
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

const GoogleMailboxPricingNotice = ( {
	domain,
	googleMailProduct,
}: {
	domain: ResponseDomain;
	googleMailProduct: ProductListItem;
} ): ReactElement | null => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	if ( ! hasGSuiteWithUs( domain ) ) {
		return null;
	}

	const purchaseCost = getGSuiteMailboxPurchaseCost( domain );

	if ( doesAdditionalPriceMatchStandardPrice( domain, googleMailProduct ) ) {
		const translateArgs = {
			args: {
				price: purchaseCost?.text,
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

	const renewalCost = getGSuiteMailboxRenewalCost( domain );
	const expiryDate = getGSuiteExpiryDate( domain );
	const priceMessage = getPriceMessage( { purchaseCost, translate } );
	const priceMessageExplanation = getPriceMessageExplanation( {
		purchaseCost,
		renewalCost,
		googleMailProduct,
		translate,
	} );
	const priceMessageRenewal = getPriceMessageRenewal( {
		expiryDate: moment( expiryDate ).format( 'LL' ),
		renewalCost,
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

export default GoogleMailboxPricingNotice;
