import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import type { FC } from 'react';

interface TosTextProps {
	isAkismetPurchase: boolean;
}

const TosText: FC< TosTextProps > = ( { isAkismetPurchase } ) => {
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
									isAkismetPurchase
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
};

export default TosText;
