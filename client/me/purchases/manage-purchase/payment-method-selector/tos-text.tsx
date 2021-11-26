import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { localizeUrl } from 'calypso/lib/i18n-utils/localize-url';

export default function TosText(): JSX.Element {
	const translate = useTranslate();
	return (
		<>
			{ translate(
				'You agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
				{
					components: {
						tosLink: (
							<a
								href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
						autoRenewalSupportPage: (
							<InlineSupportLink supportContext="autorenewal" showIcon={ false } />
						),
						faqCancellingSupportPage: (
							<InlineSupportLink supportContext="cancel_purchase" showIcon={ false } />
						),
					},
				}
			) }
		</>
	);
}
