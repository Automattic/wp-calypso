/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	getTitanExpiryDate,
	getTitanMailboxPurchaseCost,
	getTitanMailboxRenewalCost,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import Notice from 'calypso/components/notice';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

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

	return (
		<Notice icon="info-outline" showDismiss={ false } status="is-success">
			<>
				{ translate(
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
				) }{ ' ' }
				{ purchaseCost.amount < renewalCost.amount
					? translate(
							'This is less than the regular price because you are only charged for the remainder of the current month.'
					  )
					: translate(
							'This is more than the regular price because you are charged for the remainder of the current month plus any additional month until renewal.'
					  ) }{ ' ' }
				{ translate(
					'All of your mailboxes are due to renew at the regular price of {{strong}}%(fullPrice)s{{/strong}} per mailbox when your subscription renews on {{strong}}%(expiryDate)s{{/strong}}.',
					{
						args: {
							fullPrice: renewalCost.text,
							expiryDate: moment( expiryDate ).format( 'LL' ),
						},
						components: {
							strong: <strong />,
						},
						comment:
							'%(fullPrice)s is a formatted price for an email subscription (e.g. $3.50, €3.75, or PLN 4.50), ' +
							'%(expiryDate)s is a localized date (e.g. February 17, 2021)',
					}
				) }
			</>
		</Notice>
	);
};

TitanMailboxPricingNotice.propTypes = {
	domain: PropTypes.object.isRequired,
	titanMonthlyProduct: PropTypes.object.isRequired,
};

export default TitanMailboxPricingNotice;
