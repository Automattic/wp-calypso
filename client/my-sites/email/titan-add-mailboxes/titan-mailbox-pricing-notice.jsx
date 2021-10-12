import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import {
	getTitanExpiryDate,
	getTitanMailboxPurchaseCost,
	getTitanMailboxRenewalCost,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';

const doesAdditionalPriceMatchStandardPrice = ( domain, titanMonthlyProduct ) => {
	if ( ! domain || ! hasTitanMailWithUs( domain ) ) {
		return true;
	}
	const costPerAdditionalMailbox = getTitanMailboxPurchaseCost( domain );
	if ( ! costPerAdditionalMailbox ) {
		return true;
	}
	return (
		costPerAdditionalMailbox.amount === titanMonthlyProduct.cost &&
		costPerAdditionalMailbox.currency === titanMonthlyProduct.currency_code
	);
};

function getPriceMessage( purchaseCost, expiryDate, translate ) {
	return purchaseCost.amount === 0
		? translate(
				'You are still in your Professional Email trial period, so this mailbox is free for the remainder of your trial.',
				{
					args: {
						expiryDate: expiryDate,
					},
					components: {
						strong: <strong />,
					},
					comment: '%(expiryDate)s is a localized date (e.g. February 17, 2021)',
				}
		  )
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

function getPriceMessageExplanation( purchaseCost, renewalCost, translate ) {
	if ( purchaseCost.amount === 0 ) {
		return '';
	}
	return purchaseCost.amount < renewalCost.amount
		? translate(
				'This is less than the regular price because you are only charged for the remainder of the current month.'
		  )
		: translate(
				'This is more than the regular price because you are charged for the remainder of the current month plus any additional month until renewal.'
		  );
}

function getPriceMessageRenewal( renewalCost, expiryDate, translate ) {
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

const TitanMailboxPricingNotice = ( { domain, titanMonthlyProduct } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	if ( ! hasTitanMailWithUs( domain ) ) {
		return null;
	}

	const purchaseCost = getTitanMailboxPurchaseCost( domain );

	if ( doesAdditionalPriceMatchStandardPrice( domain, titanMonthlyProduct ) ) {
		return (
			<Notice icon="info-outline" showDismiss={ false } status="is-success">
				{ translate(
					'You can purchase new mailboxes at the regular price of {{strong}}%(price)s{{/strong}} per mailbox per month.',
					{
						args: {
							price: purchaseCost.text,
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(price)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50)',
					}
				) }
			</Notice>
		);
	}
	const renewalCost = getTitanMailboxRenewalCost( domain );
	const expiryDate = getTitanExpiryDate( domain );
	const expiryDateString = moment( expiryDate ).format( 'LL' );
	const priceMessage = getPriceMessage( purchaseCost, expiryDateString, translate );
	const priceMessageExplanation = getPriceMessageExplanation(
		purchaseCost,
		renewalCost,
		translate
	);
	const priceMessageRenewal = getPriceMessageRenewal( renewalCost, expiryDateString, translate );

	return (
		<Notice icon="info-outline" showDismiss={ false } status="is-success">
			<>
				{ priceMessage } { priceMessageExplanation } { priceMessageRenewal }
			</>
		</Notice>
	);
};

TitanMailboxPricingNotice.propTypes = {
	domain: PropTypes.object.isRequired,
	titanMonthlyProduct: PropTypes.object.isRequired,
};

export default TitanMailboxPricingNotice;
