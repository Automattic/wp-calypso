import SiteSurveyBanner from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-survey-banner';
import SiteWelcomeBanner from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-welcome-banner';
import showBanner from 'calypso/jetpack-cloud/sections/utils/show-banner';
import { useSelector } from 'calypso/state';
import {
	JETPACK_DASHBOARD_SURVEY_BANNER_PREFERENCE as surveyBannerPreferenceName,
	JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';

export default function Banners() {
	const bannerKey = 'licenses-page';
	const welcomeBannerPreferenceName = `${ JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE }-${ bannerKey }`;

	// Only one banner will be shown at a time
	// The order of the banners in the array determines the priority
	// So the first banner in the array will be shown first
	const banners = [
		{
			component: () => <SiteWelcomeBanner bannerKey={ bannerKey } />,
			preference: useSelector( ( state ) => getPreference( state, welcomeBannerPreferenceName ) ),
			showDays: 7,
		},
		{
			component: () => <SiteSurveyBanner />,
			preference: useSelector( ( state ) => getPreference( state, surveyBannerPreferenceName ) ),
			showDays: 30,
		},
	];

	return <div>{ showBanner( banners ) }</div>;
}
