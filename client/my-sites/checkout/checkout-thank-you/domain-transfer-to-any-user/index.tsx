import { translate } from 'i18n-calypso';
import emailImage from 'calypso/assets/images/thank-you-upsell/email.svg';
import ThankYouLayout from 'calypso/components/thank-you-v2';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getDomainPurchaseDetails } from '../redesign-v2/pages/domain-only';
import ProductDomain from '../redesign-v2/products/product-domain';

interface DomainTransferToAnyUserContainerProps {
	domain: string;
}

const DomainTransferToAnyUser: React.FC< DomainTransferToAnyUserContainerProps > = ( {
	domain,
} ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );

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

	const products = [ <ProductDomain domainName={ domain } siteSlug={ siteSlug } /> ];

	return (
		<ThankYouLayout
			title={ translate( 'Your domain transfer is underway' ) }
			subtitle={ translate(
				'Domain transfers can take a few minutes, we’ll email you once it’s set up.'
			) }
			products={ products }
			purchaseDetailsProps={ getDomainPurchaseDetails() }
			upsellProps={ upsellProps }
			masterbarProps={ {
				siteSlug,
				siteId,
				backText: siteSlug ? translate( 'Back to home' ) : undefined,
			} }
		/>
	);
};

export default DomainTransferToAnyUser;
