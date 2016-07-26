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
import support from 'lib/url/support';

const CancelPurchaseRefundInformation = ( { purchase, includedDomainPurchase } ) => {
	const { refundPeriodInDays } = purchase;
	let text;
	let showSupportLink = true;

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
				text = [
					i18n.translate(
						'This plan includes the custom domain mapping for %(mappedDomain)s, normally a %(mappingCost)s purchase. ' +
						'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
						{
							args: {
								mappedDomain: includedDomainPurchase.meta,
								mappingCost: includedDomainPurchase.priceText
							}
						}
					),
					i18n.translate(
						'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan minus ' +
						'%(mappingCost)s for the domain mapping. To cancel the domain mapping with the ' +
						'plan and ask for a full refund, please {{contactLink}}contact support{{/contactLink}}.',
						{
							args: {
								planCost: purchase.priceText,
								mappingCost: includedDomainPurchase.priceText,
								refundAmount: purchase.refundText
							},
							components: {
								contactLink: <a href={ support.CALYPSO_CONTACT } />
							}
						}
					)
				];

				showSupportLink = false;
			} else if ( includedDomainPurchase && isDomainRegistration( includedDomainPurchase ) ) {
				text = [
					i18n.translate(
						'This plan includes the custom domain, %(domain)s, normally a %(domainCost)s purchase. ' +
						'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
						{
							args: {
								domain: includedDomainPurchase.meta,
								domainCost: includedDomainPurchase.priceText,
							}
						}
					),
					i18n.translate(
						'You will receive a partial refund of %(refundAmount)s which is %(planCost)s for the plan ' +
						'minus %(domainCost)s for the domain. To cancel the domain with the plan and ask for a full ' +
						'refund, please {{contactLink}}contact support{{/contactLink}}.',
						{
							args: {
								domainCost: includedDomainPurchase.priceText,
								planCost: purchase.priceText,
								refundAmount: purchase.refundText
							},
							components: {
								contactLink: <a href={ support.CALYPSO_CONTACT } />
							}
						}
					)
				];

				showSupportLink = false;
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
	} else if ( isSubscription( purchase ) && includedDomainPurchase && isDomainMapping( includedDomainPurchase ) ) {
		text = i18n.translate(
			'This plan includes the custom domain mapping for %(mappedDomain)s. ' +
			'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
			{
				args: {
					mappedDomain: includedDomainPurchase.meta,
					mappingCost: includedDomainPurchase.priceText
				}
			}
		);
	} else if ( isSubscription( purchase ) && includedDomainPurchase && isDomainRegistration( includedDomainPurchase ) ) {
		text = i18n.translate(
			'This plan includes the custom domain, %(domain)s. ' +
			'The domain will not be removed along with the plan, to avoid any interruptions for your visitors. ',
			{
				args: {
					domain: includedDomainPurchase.meta,
					domainCost: includedDomainPurchase.priceText,
				}
			}
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
		<div className="cancel-purchase__info">
			{ Array.isArray( text )
				? text.map( ( paragraph, index ) =>
					<p key={ purchase.id + '_refund_p_' + index } className="cancel-purchase__refund-information">
						{ paragraph }
					</p>
					)
				: <p className="cancel-purchase__refund-information">{ text }</p>
			}

			{ showSupportLink && (
				<strong className="cancel-purchase__support-information">
				{ i18n.translate( 'Have a question? {{contactLink}}Ask a Happiness Engineer!{{/contactLink}}', {
					components: {
						contactLink: <a href={ support.CALYPSO_CONTACT }/>
					}
				} ) }
				</strong> )
			}
		</div>
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
