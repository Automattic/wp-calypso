import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';
import { useLocale } from '@automattic/i18n-utils';
import { getSiteLaunchStatus } from '@automattic/sites';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import ReactDOM from 'react-dom';
import surveyImage from 'calypso/assets/images/illustrations/dotcom-logo.svg';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import SurveyModal from 'calypso/components/survey-modal';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export function BusinessMerchantLaunchSurveyModal() {
	const localeSlug = useLocale();
	const site = useSelector( getSelectedSite );
	const siteId = site?.ID;
	const planSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );

	useQuerySitePurchases( siteId );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	// Only show to en locale.
	if ( localeSlug !== 'en' ) {
		return null;
	}

	// Only show to sites with Business or Commerce plans.
	if ( ! isBusinessPlan( planSlug ) && ! isEcommercePlan( planSlug ) ) {
		return null;
	}

	const planPurchase = purchases.find( ( purchase ) => purchase.productSlug === planSlug );
	if ( ! planPurchase?.subscribedDate ) {
		return null;
	}
	const subscribedMoment = moment( planPurchase.subscribedDate );

	// Only show to sites with plan subscribed after certain threshold, and has been owned for at least 7 days.
	if (
		! (
			subscribedMoment.isAfter( moment( '2024-06-01' ) ) &&
			subscribedMoment.isBefore( moment().subtract( 7, 'days' ) )
		)
	) {
		return null;
	}

	const title = translate( 'Help us serve you better' );
	const description = translate(
		'Got a minute? Take our short 6-question survey and let us know how we can make your experience even better.'
	);

	const launchStatus = getSiteLaunchStatus( site );
	const surveyUrl =
		launchStatus === 'public'
			? 'https://automattic.survey.fm/businesses-merchants-who-have-launched-website'
			: 'https://automattic.survey.fm/businesses-merchants-who-not-launched-website';

	return ReactDOM.createPortal(
		<SurveyModal
			name="business-merchant-launch-survey"
			url={ surveyUrl }
			title={ title }
			description={ description }
			surveyImage={ surveyImage }
			dismissText={ translate( 'Dismiss' ) }
			confirmText={ translate( 'Start the survey' ) }
			showOverlay={ false }
		/>,
		document.body
	);
}
