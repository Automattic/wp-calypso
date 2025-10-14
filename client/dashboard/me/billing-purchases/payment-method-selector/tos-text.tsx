import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../../components/inline-support-link';

interface TosTextProps {
	isAkismetPurchase: boolean;
	is100YearPlanPurchase: boolean;
	is100YearDomainPurchase: boolean;
}

export default function TosText( {
	isAkismetPurchase,
	is100YearPlanPurchase,
	is100YearDomainPurchase,
}: TosTextProps ) {
	if ( is100YearPlanPurchase || is100YearDomainPurchase ) {
		return (
			<>
				{ createInterpolateElement( __( 'You agree to our <tosLink>Terms of Service</tosLink>.' ), {
					tosLink: (
						<ExternalLink
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							rel="noopener noreferrer"
							children={ undefined }
						/>
					),
				} ) }
			</>
		);
	}

	return (
		<>
			{ createInterpolateElement(
				__(
					'You agree to our <tosLink>Terms of Service</tosLink> and authorize your payment method to be charged on a recurring basis until you cancel, which you can do at any time. You understand <autoRenewalSupportPage>how your subscription works</autoRenewalSupportPage> and <faqCancellingSupportPage>how to cancel</faqCancellingSupportPage>.'
				),
				{
					tosLink: (
						<ExternalLink
							href={
								isAkismetPurchase
									? localizeUrl( 'https://akismet.com/tos/' )
									: localizeUrl( 'https://wordpress.com/tos/' )
							}
							rel="noopener noreferrer"
							children={ undefined }
						/>
					),
					autoRenewalSupportPage: <InlineSupportLink supportContext="autorenewal" />,
					faqCancellingSupportPage: <InlineSupportLink supportContext="cancel_purchase" />,
				}
			) }
		</>
	);
}
