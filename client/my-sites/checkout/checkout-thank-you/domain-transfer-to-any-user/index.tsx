import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import Main from 'calypso/components/main';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import MasterbarStyled from '../redesign-v2/masterbar-styled';
import getDomainFooterDetails from '../redesign-v2/pages/content/get-domain-footer-details';
import ThankYouDomainProduct from '../redesign-v2/products/domain-product';

interface DomainTransferToAnyUserContainerProps {
	domain: string;
}

const DomainTransferToAnyUser: React.FC< DomainTransferToAnyUserContainerProps > = ( {
	domain,
} ) => {
	const upsellProps = {
		title: translate( 'Professional email' ),
		description: translate(
			'85% of people trust an email address with a custom domain name over a generic one.'
		),
		icon: emailImage,
		action: (
			<Button
				href={ getEmailManagementPath( domain, domain ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_transfer_thank_you_professional_email_click' )
				}
			>
				{ translate( 'Add email' ) }
			</Button>
		),
	};

	return (
		<Main className="is-redesign-v2">
			<MasterbarStyled canGoBack={ false } />

			<ThankYouV2
				title={ translate( 'Your domain transfer is underway' ) }
				subtitle={ translate(
					'Domain transfers can take a few minutes, we’ll email you once it’s set up.'
				) }
				products={ <ThankYouDomainProduct domainName={ domain } key="transferred-domain" /> }
				footerDetails={ getDomainFooterDetails() }
				upsellProps={ upsellProps }
			/>
		</Main>
	);
};

export default DomainTransferToAnyUser;
