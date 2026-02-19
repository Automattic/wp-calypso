import config from '@automattic/calypso-config';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Text } from '../../../components/text';
import {
	hasAmountAvailableToRefund,
	isOneTimePurchase,
	shouldShowRefundEligibilityNotice,
} from '../../../utils/purchase';
import type { Purchase, Domain } from '@automattic/api-core';

interface CancelPurchaseRefundInformationProps {
	purchase: Purchase;
	isJetpackPurchase: boolean;
	selectedDomain: Domain | null | undefined;
}

const CancelPurchaseRefundInformation = ( {
	purchase,
	isJetpackPurchase,
	selectedDomain,
}: CancelPurchaseRefundInformationProps ) => {
	const isGravatarRestrictedDomain = selectedDomain?.is_gravatar_restricted_domain;
	const { refund_period_in_days: refundPeriodInDays } = purchase;
	let text;

	// Treat refundable dotcom plans as non-refundable since refund is offered via the notice
	const treatAsNonRefundable = shouldShowRefundEligibilityNotice( purchase );

	if ( purchase.is_refundable && ! treatAsNonRefundable ) {
		if ( purchase.is_domain_registration ) {
			// Domain bought with domain credits, so there's no refund
			if ( ! hasAmountAvailableToRefund( purchase ) ) {
				text = sprintf(
					/* Translators: %(refundPeriodInDays)s is a number representing the number of days after purchase that a refund will allowed. */
					__(
						'When you cancel your domain within %(refundPeriodInDays)s days of purchasing, ' +
							'it will be removed from your site immediately.'
					),
					{ refundPeriodInDays }
				);
			} else {
				text = sprintf(
					/* Translators: %(refundPeriodInDays)s is a number representing the number of days after purchase that a refund will allowed. */
					__(
						'When you cancel your domain within %(refundPeriodInDays)s days of purchasing, ' +
							"you'll receive a refund and it will be removed from your site immediately."
					),
					{ refundPeriodInDays }
				);
			}
		}

		if ( ! isOneTimePurchase( purchase ) && ! purchase.is_domain_registration ) {
			text = [
				sprintf(
					/* Translators: %(productName)s is the name of the plan that the customer is cancelling. */
					__(
						"We're sorry to hear the %(productName)s plan didn't fit your current needs, but thank you for giving it a try."
					),
					{
						productName: purchase.product_name,
					}
				),
			];
			if ( isJetpackPurchase && config.isEnabled( 'jetpack/cancel-through-main-flow' ) ) {
				// Refundable Jetpack subscription
				text = [];
				text.push(
					sprintf(
						/* Translators: %(refundPeriodInDays)s is a number representing the number of days after purchase that a refund will allowed. */
						__(
							'Because you are within the %(refundPeriodInDays)s day refund period,' +
								'your plan will be cancelled and removed from your site immediately and you will receive a full refund.'
						),
						{ refundPeriodInDays }
					),
					__(
						'If you want to keep the subscription until the renewal date, please cancel after the refund period has ended.'
					)
				);
			} else {
				text = sprintf(
					/* Translators: %(refundPeriodInDays)s is a number representing the number of days after purchase that a refund will allowed. */
					__(
						'When you cancel your subscription within %(refundPeriodInDays)s days of purchasing, ' +
							"you'll receive a refund and it will be removed from your site immediately."
					),
					{ refundPeriodInDays }
				);
			}
		}

		if ( isOneTimePurchase( purchase ) ) {
			text = sprintf(
				/* Translators: %(refundPeriodInDays)s is a number representing the number of days after purchase that a refund will allowed. */
				__(
					'When you cancel this purchase within %(refundPeriodInDays)s days of purchasing, ' +
						"you'll receive a refund and it will be removed from your site immediately."
				),
				{ refundPeriodInDays }
			);
		}
	} else if ( purchase.is_domain_registration ) {
		text = [
			__(
				'When you cancel your domain, it will remain registered and active until the registration expires, ' +
					'at which point it will be automatically removed from your site.'
			),
		];

		if ( isGravatarRestrictedDomain ) {
			text.push(
				__(
					'This domain is provided at no cost for the first year for use with your Gravatar profile. This offer is limited to one free domain per user. If you cancel this domain, you will have to pay the standard price to register another domain for your Gravatar profile.'
				)
			);
		}
	} else {
		text = sprintf(
			/* Translators: %(productName)s is the name of the plan that the customer is cancelling. */
			__(
				"When you cancel your subscription, you'll be able to use %(productName)s until your subscription expires. " +
					'Once it expires, it will be automatically removed from your site.'
			),
			{
				productName: purchase.product_name,
			}
		);
	}

	if ( ! text ) {
		return null;
	}

	return (
		<VStack>
			{ Array.isArray( text ) ? (
				text.map( ( paragraph, index ) => (
					<Text as="p" key={ purchase?.ID + '_refund_p_' + index }>
						{ paragraph }
					</Text>
				) )
			) : (
				<Text as="p">{ text }</Text>
			) }
		</VStack>
	);
};

export default CancelPurchaseRefundInformation;
