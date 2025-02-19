import config from '@automattic/calypso-config';
import { isDomainRegistration } from '@automattic/calypso-products';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getName,
	hasAmountAvailableToRefund,
	isRefundable,
	isSubscription,
	isOneTimePurchase,
} from 'calypso/lib/purchases';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';

const CancelPurchaseRefundInformation = ( {
	purchase,
	isGravatarRestrictedDomain,
	isJetpackPurchase,
} ) => {
	const { refundPeriodInDays } = purchase;
	let text;

	if ( isRefundable( purchase ) ) {
		if ( isDomainRegistration( purchase ) ) {
			// Domain bought with domain credits, so there's no refund
			if ( ! hasAmountAvailableToRefund( purchase ) ) {
				text = i18n.translate(
					'When you cancel your domain within %(refundPeriodInDays)d days of purchasing, ' +
						'it will be removed from your site immediately.',
					{
						args: { refundPeriodInDays },
					}
				);
			} else {
				text = i18n.translate(
					'When you cancel your domain within %(refundPeriodInDays)d days of purchasing, ' +
						"you'll receive a refund and it will be removed from your site immediately.",
					{
						args: { refundPeriodInDays },
					}
				);
			}
		}

		if ( isSubscription( purchase ) ) {
			text = [
				i18n.translate(
					"We're sorry to hear the %(productName)s plan didn't fit your current needs, but thank you for giving it a try.",
					{
						args: {
							productName: getName( purchase ),
						},
					}
				),
			];
			if ( isJetpackPurchase && config.isEnabled( 'jetpack/cancel-through-main-flow' ) ) {
				// Refundable Jetpack subscription
				text = [];
				text.push(
					i18n.translate(
						'Because you are within the %(refundPeriodInDays)d day refund period, ' +
							'your plan will be cancelled and removed from your site immediately and you will receive a full refund. ',
						{
							args: { refundPeriodInDays },
						}
					),
					i18n.translate(
						'If you want to keep the subscription until the renewal date, please cancel after the refund period has ended.'
					)
				);
			} else {
				text = i18n.translate(
					'When you cancel your subscription within %(refundPeriodInDays)d days of purchasing, ' +
						"you'll receive a refund and it will be removed from your site immediately.",
					{
						args: { refundPeriodInDays },
					}
				);
			}
		}

		if ( isOneTimePurchase( purchase ) ) {
			text = i18n.translate(
				'When you cancel this purchase within %(refundPeriodInDays)d days of purchasing, ' +
					"you'll receive a refund and it will be removed from your site immediately.",
				{
					args: { refundPeriodInDays },
				}
			);
		}
	} else if ( isDomainRegistration( purchase ) ) {
		text = [
			i18n.translate(
				'When you cancel your domain, it will remain registered and active until the registration expires, ' +
					'at which point it will be automatically removed from your site.'
			),
		];

		if ( isGravatarRestrictedDomain ) {
			text.push(
				i18n.translate(
					'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you cancel this domain, you will have to pay the standard price to register another domain for your Gravatar profile.'
				)
			);
		}
	} else {
		text = i18n.translate(
			"When you cancel your subscription, you'll be able to use %(productName)s until your subscription expires. " +
				'Once it expires, it will be automatically removed from your site.',
			{
				args: {
					productName: getName( purchase ),
				},
			}
		);
	}

	if ( ! text ) {
		return null;
	}

	return (
		<div className="cancel-purchase__info">
			{ Array.isArray( text ) ? (
				text.map( ( paragraph, index ) => (
					<p key={ purchase.id + '_refund_p_' + index } className="cancel-purchase__refund-details">
						{ paragraph }
					</p>
				) )
			) : (
				<p className="cancel-purchase__refund-details">{ text }</p>
			) }
		</div>
	);
};

CancelPurchaseRefundInformation.propTypes = {
	purchase: PropTypes.object.isRequired,
	isJetpackPurchase: PropTypes.bool.isRequired,
	cancelBundledDomain: PropTypes.bool,
	confirmCancelBundledDomain: PropTypes.bool,
	onCancelConfirmationStateChange: PropTypes.func,
};

export default connect( ( state, props ) => {
	const domains = getDomainsBySiteId( state, props.purchase.siteId );
	const selectedDomainName = getName( props.purchase );
	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );

	return {
		isGravatarRestrictedDomain: selectedDomain?.isGravatarRestrictedDomain,
	};
} )( CancelPurchaseRefundInformation );
