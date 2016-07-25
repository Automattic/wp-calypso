/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getName, isRefundable, isSubscription, isOneTimePurchase } from 'lib/purchases';
import { isDomainRegistration, isDomainMapping } from 'lib/products-values';
import { getIncludedDomainPurchase } from 'state/purchases/selectors';

const CancelPurchaseRefundInformation = ( { purchase, includedDomainPurchase } ) => {
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
			if ( includedDomainPurchase && isDomainMapping( includedDomainPurchase ) ) {
				text = i18n.translate(
					'This plan includes the custom domain mapping for %(mappedDomain)s, normally a %(mappingCost)s purchase. ' +
					'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ' +
					'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan minus ' +
					'%(mappingCost)s for the domain mapping. To cancel the domain mapping with the ' +
					'plan and ask for a full refund, please contact support.',
					{
						args: {
							mappedDomain: includedDomainPurchase.meta,
							mappingCost: includedDomainPurchase.priceText,
							planCost: purchase.priceText,
							refundAmount: purchase.refundText
						}
					}
				);
			} else if ( includedDomainPurchase && isDomainRegistration( includedDomainPurchase ) ) {
				text = i18n.translate(
					'This plan includes the custom domain, %(domain)s, normally a %(domainCost)s purchase. ' +
					'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ' +
					'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
					'minus %(domainCost)s for the domain.  To cancel the domain with the plan and ask for a full ' +
					'refund, please contact support.',
					{
						args: {
							domain: includedDomainPurchase.meta,
							domainCost: includedDomainPurchase.priceText,
							planCost: purchase.priceText,
							refundAmount: purchase.refundText
						}
					}
				);
			} else {
				text = i18n.translate(
					'When you cancel your subscription within %(refundPeriodInDays)d days of purchasing, ' +
					"you'll receive a refund and it will be removed from your site immediately.",
					{
						args: { refundPeriodInDays }
					}
				);
			}
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
	purchase: React.PropTypes.object.isRequired,
	includedDomainPurchase: React.PropTypes.object
};

export default connect(
	( state, props ) => ( {
		includedDomainPurchase: getIncludedDomainPurchase( state, props.purchase )
	} )
)( CancelPurchaseRefundInformation );
