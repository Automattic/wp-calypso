import { useTranslate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import getTitanFooterDetails from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/pages/content/get-titan-footer-details';
import { ThankYouTitanProduct } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/products/titan-product';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Import styles
 */
import './style.scss';

type TitanSetUpThankYouProps = {
	domainName: string;
	emailAddress?: string;
	isDomainOnlySite?: boolean;
	numberOfMailboxesPurchased?: number;
};

const TitanSetUpThankYou = ( {
	domainName,
	emailAddress,
	isDomainOnlySite = false,
	numberOfMailboxesPurchased,
}: TitanSetUpThankYouProps ) => {
	const selectedSite = useSelector( getSelectedSite );
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSiteSlug = selectedSite?.slug ?? ( isDomainOnlySite ? domainName : null );
	const translate = useTranslate();

	let title;
	let subtitle;

	if ( emailAddress ) {
		title = translate( 'Say hello to your new email address' );
		subtitle = translate( "All set! Now it's time to update your contact details." );
	} else {
		title = translate( 'Congratulations on your purchase!' );
		subtitle = translate(
			'Complete your professional email setup to start sending and receiving emails from your custom domain today.'
		);
	}

	const products = (
		<ThankYouTitanProduct
			domainName={ domainName }
			siteSlug={ selectedSiteSlug }
			emailAddress={ emailAddress }
			numberOfMailboxesPurchased={ numberOfMailboxesPurchased }
		/>
	);

	return (
		<>
			<ThankYouV2
				title={ title }
				subtitle={ subtitle }
				products={ products }
				footerDetails={ getTitanFooterDetails(
					selectedSiteSlug,
					domainName,
					currentRoute,
					'titan-setup'
				) }
			/>
		</>
	);
};

export default TitanSetUpThankYou;
