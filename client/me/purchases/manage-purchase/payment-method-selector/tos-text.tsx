import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import InlineSupportLink from 'calypso/components/inline-support-link';

export default function TosText() {
	const translate = useTranslate();
	return (
		<>
			{ translate(
				'You agree to our {{tosLink}}Terms of Service{{/tosLink}} and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand {{autoRenewalSupportPage}}how your subscription works{{/autoRenewalSupportPage}} and {{faqCancellingSupportPage}}how to cancel{{/faqCancellingSupportPage}}.',
				{
					components: {
						tosLink: (
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
