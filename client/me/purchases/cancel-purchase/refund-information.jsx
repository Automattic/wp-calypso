/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { getSubscriptionEndDate, isRefundable } from 'lib/purchases';

const CancelPurchaseRefundInformation = React.createClass( {
	propTypes: {
		purchase: React.PropTypes.object.isRequired
	},

	render() {
		const purchase = this.props.purchase,
			{ priceText, refundPeriodInDays } = purchase,
			refundsSupportLink = <a href="https://support.wordpress.com/refunds/" target="_blank" />;

		if ( isRefundable( purchase ) ) {
			return (
				<p>{ this.translate(
					'Yes! You are canceling this purchase within the %(refundPeriodInDays)d day refund period. ' +
					'Once you confirm, your card will be refunded %(priceText)s. {{a}}Learn more{{/a}}.',
					{
						args: {
							refundPeriodInDays,
							priceText
						},
						components: {
							a: refundsSupportLink
						},
						context: 'priceText is of the form "[currency-symbol][amount] [currency-code]" i.e. "$20 USD"'
					}
				) }</p>
			);
		}

		return (
			<p>{ this.translate(
				'You are canceling after the %(refundPeriodInDays)d day refund period, so you will not receive a refund. ' +
				'Canceling will prevent automatic renewal, and we will leave this purchase active until %(subscriptionEndDate)s. ' +
				'{{a}}Learn more.{{/a}}',
				{
					args: {
						subscriptionEndDate: getSubscriptionEndDate( purchase ),
						refundPeriodInDays
					},
					components: {
						a: refundsSupportLink
					}
				}
			) }</p>
		);
	}
} );

export default CancelPurchaseRefundInformation;
