import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import TosText from 'calypso/me/purchases/manage-purchase/payment-method-selector/tos-text';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';

export const TermsOfService = ( {
	hasRenewableSubscription,
	isGiftPurchase,
	is100YearPlanPurchase,
	is100YearDomainPurchase,
}: {
	hasRenewableSubscription: boolean;
	isGiftPurchase: boolean;
	is100YearPlanPurchase: boolean;
	is100YearDomainPurchase: boolean;
} ) => {
	const translate = useTranslate();
	const recordTermsAndConditionsClick = () => {
		gaRecordEvent( 'Upgrades', 'Clicked Terms and Conditions Link' );
	};

	const renderTerms = () => {
		let message = translate( 'You agree to our {{link}}Terms of Service{{/link}}.', {
			components: {
				link: (
					<a
						href={
							isAkismetCheckout()
								? localizeUrl( 'https://akismet.com/tos/' )
								: localizeUrl( 'https://wordpress.com/tos/' )
						}
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			},
		} );

		// Don't show the extended ToS notice for one-time purchases or gifts
		if ( ! isGiftPurchase && hasRenewableSubscription ) {
			message = (
				<TosText
					isAkismetPurchase={ isAkismetCheckout() }
					is100YearPlanPurchase={ is100YearPlanPurchase }
					is100YearDomainPurchase={ is100YearDomainPurchase }
				/>
			);
		}

		return message;
	};

	return (
		<CheckoutTermsItem onClick={ recordTermsAndConditionsClick }>
			{ renderTerms() }
		</CheckoutTermsItem>
	);
};
