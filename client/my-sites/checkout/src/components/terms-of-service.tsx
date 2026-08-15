import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import TosText from 'calypso/me/purchases/manage-purchase/payment-method-selector/tos-text';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import { getStudioCodeAiCreditsGuidelinesUrl } from './studio-code-ai-credits-guidelines';

export const TermsOfService = ( {
	hasStudioCodeAiCredits,
	hasRenewableSubscription,
	isGiftPurchase,
	is100YearPlanPurchase,
	is100YearDomainPurchase,
}: {
	hasStudioCodeAiCredits: boolean;
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
		const components = {
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
		};

		let message = hasStudioCodeAiCredits
			? translate(
					'You agree to our {{link}}Terms of Service{{/link}} and {{guidelines}}AI Credits Guidelines{{/guidelines}}.',
					{
						components: {
							...components,
							guidelines: (
								<a
									href={ getStudioCodeAiCreditsGuidelinesUrl() }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
			  )
			: translate( 'You agree to our {{link}}Terms of Service{{/link}}.', { components } );

		// Don't show the extended ToS notice for one-time purchases or gifts
		if ( ! isGiftPurchase && hasRenewableSubscription ) {
			message = (
				<TosText
					isAkismetPurchase={ isAkismetCheckout() }
					is100YearPlanPurchase={ is100YearPlanPurchase }
					is100YearDomainPurchase={ is100YearDomainPurchase }
					hasStudioCodeAiCredits={ hasStudioCodeAiCredits }
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
