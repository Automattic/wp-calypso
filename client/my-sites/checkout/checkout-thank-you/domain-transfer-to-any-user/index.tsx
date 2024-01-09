import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import Main from 'calypso/components/main';
import MasterbarStyled from 'calypso/components/masterbar-styled';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getDomainFooterDetails } from '../redesign-v2/pages/domain-only';
import ProductDomain from '../redesign-v2/products/product-domain';

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
		meshColor: 'blue',
		icon: emailImage,
		action: (
			<Button
				href={ emailManagement( domain, domain ) }
				onClick={ () =>
					recordTracksEvent( 'calypso_domain_transfer_thank_you_professional_email_click' )
				}
			>
				{ translate( 'Add email' ) }
			</Button>
		),
	};

	const products = [ <ProductDomain domainName={ domain } /> ];

	return (
		<Main className="is-redesign-v2">
			<PageViewTracker
				path="checkout/domain-transfer-to-any-user/thank-you/:domain"
				title="Checkout Thank You"
			/>

			<MasterbarStyled canGoBack={ false } showContact={ true } />

			<ThankYouV2
				title={ translate( 'Your domain transfer is underway' ) }
				subtitle={ translate(
					'Domain transfers can take a few minutes, we’ll email you once it’s set up.'
				) }
				products={ products }
				footerDetails={ getDomainFooterDetails() }
				upsellProps={ upsellProps }
			/>
		</Main>
	);
};

export default DomainTransferToAnyUser;
