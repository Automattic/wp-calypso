import { isStarter, isGSuiteOrExtraLicenseOrGoogleWorkspace } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import earnImage from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import analyticsImage from 'calypso/assets/images/illustrations/google-analytics.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from '@automattic/calypso-products';
import type { SitesPlansResult } from 'calypso/my-sites/checkout/src/hooks/product-variants';

const StarterPlanDetails = ( {
	selectedSite,
	sitePlans,
	purchases,
}: {
	selectedSite: null | false | { slug: string };
	sitePlans: SitesPlansResult;
	purchases: Array< WithSnakeCaseSlug | WithCamelCaseSlug >;
} ) => {
	const translate = useTranslate();
	const plan = sitePlans.data?.find( isStarter );
	const googleAppsWasPurchased = purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace );
	const selectedSiteSlug = selectedSite ? selectedSite.slug : '';

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails purchases={ purchases } /> }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon={ <img alt={ translate( 'Earn Illustration' ) } src={ earnImage } /> }
				title={ translate( 'Make money with your website' ) }
				description={ translate(
					'Accept credit card payments today for just about anything – physical and digital goods, services, ' +
						'donations and tips, or access to your exclusive content.'
				) }
				buttonText={ translate( 'Start Earning' ) }
				href={ '/earn/' + selectedSiteSlug }
			/>

			<PurchaseDetail
				icon={ <img alt="" src={ analyticsImage } /> }
				title={ translate( 'Connect to Google Analytics' ) }
				description={ translate(
					"Complement WordPress.com's stats with Google's in-depth look at your visitors and traffic patterns."
				) }
				buttonText={ translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSiteSlug }
			/>
		</div>
	);
};

export default StarterPlanDetails;
