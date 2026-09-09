import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { getStudioCodeAiCreditsGuidelinesUrl } from 'calypso/my-sites/checkout/src/components/studio-code-ai-credits-guidelines';

interface TosTextProps {
	isAkismetPurchase: boolean;
	is100YearPlanPurchase: boolean;
	is100YearDomainPurchase: boolean;
	hasStudioCodeAiCredits?: boolean;
}

export default function TosText( {
	isAkismetPurchase,
	is100YearPlanPurchase,
	is100YearDomainPurchase,
	hasStudioCodeAiCredits = false,
}: TosTextProps ) {
	const translate = useTranslate();

	if ( is100YearPlanPurchase || is100YearDomainPurchase ) {
		const components = {
			tosLink: (
				<a
					href={ localizeUrl( 'https://wordpress.com/tos/' ) }
					target="_blank"
					rel="noopener noreferrer"
				/>
			),
		};

		return (
			<>
				{ hasStudioCodeAiCredits
					? translate(
							'You agree to our {{tosLink}}Terms of Service{{/tosLink}} and {{guidelines}}AI Credits Guidelines{{/guidelines}}.',
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
					: translate( 'You agree to our {{tosLink}}Terms of Service{{/tosLink}}.', {
							components,
					  } ) }
			</>
		);
	}

	const components = {
		tosLink: (
			<a
				href={
					isAkismetPurchase
						? localizeUrl( 'https://akismet.com/tos/' )
						: localizeUrl( 'https://wordpress.com/tos/' )
				}
				target="_blank"
				rel="noopener noreferrer"
			/>
		),
		autoRenewalSupportPage: <InlineSupportLink supportContext="autorenewal" showIcon={ false } />,
		faqCancellingSupportPage: (
			<InlineSupportLink supportContext="cancel_purchase" showIcon={ false } />
		),
	};

	return (
		<>
			{ hasStudioCodeAiCredits
				? translate(
						'You agree to our {{tosLink}}Terms of Service{{/tosLink}} and {{guidelines}}AI Credits Guidelines{{/guidelines}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
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
				: translate(
						'You agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
						{ components }
				  ) }
		</>
	);
}
