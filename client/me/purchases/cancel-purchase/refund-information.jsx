/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getName, isRefundable, isSubscription, isOneTimePurchase } from 'lib/purchases';
import { isDomainRegistration } from 'lib/products-values';

const CancelPurchaseRefundInformation = ( { purchase } ) => {
	const { refundPeriodInDays } = purchase;

	let text;

	if ( isRefundable( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			text = i18n.translate(
				'When you cancel your domain within %(refundPeriodInDays)d days of purchasing, ' +
				"you'll receive a refund and it will be removed from your site immediately.",
				{
					args: { refundPeriodInDays }
				}
			);
		}

		if ( isSubscription( purchase ) ) {
			text = i18n.translate(
				'When you cancel your subscription within %(refundPeriodInDays)d days of purchasing, ' +
				"you'll receive a refund and it will be removed from your site immediately.",
				{
					args: { refundPeriodInDays }
				}
			);
		}

		if ( isOneTimePurchase( purchase ) ) {
			text = i18n.translate(
				'When you cancel this purchase within %(refundPeriodInDays)d days of purchasing, ' +
				"you'll receive a refund and it will be removed from your site immediately.",
				{
					args: { refundPeriodInDays }
				}
			);
		}
	} else if ( isDomainRegistration( purchase ) ) {
		text = i18n.translate(
			'When you cancel your domain, it will remain registered and active until the registration expires, ' +
			'at which point it will be automatically removed from your site.'
		);
	} else {
		text = i18n.translate(
			"When you cancel your subscription, you'll be able to use %(productName)s until your subscription expires. " +
			'Once it expires, it will be automatically removed from your site.',
			{
				args: {
					productName: getName( purchase )
				}
			}
		);
	}

	return (
		<p className="cancel-purchase__refund-information">{ text }</p>
	);
};

CancelPurchaseRefundInformation.propTypes = {
	purchase: React.PropTypes.object.isRequired
};

export default CancelPurchaseRefundInformation;
