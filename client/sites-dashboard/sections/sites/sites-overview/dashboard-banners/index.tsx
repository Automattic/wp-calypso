import { isEnabled } from '@automattic/calypso-config';
import showBanner from 'calypso/jetpack-cloud/sections/utils/show-banner';
import { useSelector } from 'calypso/state';
import {
	JETPACK_DASHBOARD_SURVEY_BANNER_PREFERENCE as surveyBannerPreferenceName,
	JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE_HOME_PAGE as welcomeBannerPreferenceName,
	JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_BANNER_PREFERENCE as downtimeMonitoringUpgradeBannerPreferenceName,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import SiteDowntimeMonitoringUpgradeBanner from '../site-downtime-monitoring-upgrade-banner';
import SiteSurveyBanner from '../site-survey-banner';
import SiteWelcomeBanner from '../site-welcome-banner';

export default function DashboardBanners() {
	// Only one banner will be shown at a time
	// The order of the banners in the array determines the priority
	// So the first banner in the array will be shown first
	const banners = [
		{
			component: () => <SiteWelcomeBanner isDashboardView />,
			preference: useSelector( ( state ) => getPreference( state, welcomeBannerPreferenceName ) ),
			showDays: 7,
		},
		{
			component: () => <SiteDowntimeMonitoringUpgradeBanner />,
			preference: useSelector( ( state ) =>
				getPreference( state, downtimeMonitoringUpgradeBannerPreferenceName )
			),
			showDays: 7,
			hideBanner: ! isEnabled( 'jetpack/pro-dashboard-monitor-paid-tier' ),
		},
		{
			component: () => <SiteSurveyBanner isDashboardView />,
			preference: useSelector( ( state ) => getPreference( state, surveyBannerPreferenceName ) ),
			showDays: 30,
			hideBanner: true,
		},
	];

	return showBanner( banners );
}
