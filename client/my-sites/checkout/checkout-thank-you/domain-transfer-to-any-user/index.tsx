import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import MasterbarStyled from 'calypso/components/masterbar-styled';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getDomainPurchaseDetails } from '../redesign-v2/pages/domain-only';
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
		href: emailManagement( domain, domain ),
		buttonText: translate( 'Add email' ),
		trackEvent: 'calypso_domain_transfer_thank_you_professional_email_click',
	};

	const products = [ <ProductDomain domainName={ domain } /> ];

	return (
		<>
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
				purchaseDetailsProps={ getDomainPurchaseDetails() }
				upsellProps={ upsellProps }
			/>
		</>
	);
};

export default DomainTransferToAnyUser;
