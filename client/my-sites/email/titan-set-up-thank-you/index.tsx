import { useTranslate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP } from 'calypso/lib/titan/constants';
import { ThankYouEmailProduct } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/products/email-product';
import { recordEmailAppLaunchEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { getTitanControlPanelRedirectPath } from 'calypso/my-sites/email/paths';
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
};

const TitanSetUpThankYou = ( {
	domainName,
	emailAddress,
	isDomainOnlySite = false,
}: TitanSetUpThankYouProps ) => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = selectedSite?.slug ?? ( isDomainOnlySite ? domainName : null );
	const translate = useTranslate();

	const titanControlPanelUrl = getTitanControlPanelRedirectPath(
		selectedSiteSlug,
		domainName,
		currentRoute,
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
		}
	);

	const footerDetails = [
		{
			key: 'footer-manage-email',
			title: translate( 'Manage your email and site from anywhere' ),
			description: translate(
				'The Jetpack mobile app for iOS and Android makes managing your email, domain, and website even simpler.'
			),
			buttonText: translate( 'Get the app' ),
			buttonHref: titanControlPanelUrl,
			buttonOnClick: () => {
				recordEmailAppLaunchEvent( {
					provider: 'titan',
					app: 'app',
					context: 'checkout-thank-you',
				} );
			},
		},
		{
			key: 'footer-questions-email',
			title: translate( 'Email questions? find answers' ),
			description: translate(
				'Explore our comprehensive support guides and find solutions to all your email tinquiries.'
			),
			buttonText: translate( 'Email support resources' ),
			buttonHref: '/support/category/domains-and-email/email/',
		},
	];

	const products = ! emailAddress ? undefined : (
		<ThankYouEmailProduct
			domainName={ domainName }
			siteSlug={ selectedSiteSlug }
			emailAddress={ emailAddress }
		/>
	);

	return (
		<>
			<ThankYouV2
				title={ translate( 'Say hello to your new email address' ) }
				subtitle={ translate( "All set! Now it's time to update your contact details." ) }
				products={ products }
				footerDetails={ footerDetails }
			/>
		</>
	);
};

export default TitanSetUpThankYou;
