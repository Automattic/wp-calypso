import { useTranslate } from 'i18n-calypso';
import { ReactElement, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import tipIcon from 'calypso/assets/images/jetpack/tip-icon.svg';
import Banner from 'calypso/components/banner';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE,
	JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE_HOME_PAGE as homePagePreferenceName,
	getJetpackDashboardWelcomeBannerPreference as getPreference,
} from 'calypso/state/partner-portal/agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import type { PreferenceType } from '../types';

export default function SiteWelcomeBanner( {
	isDashboardView,
	bannerKey,
}: {
	isDashboardView?: boolean;
	bannerKey?: string;
} ): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const preferenceName = isDashboardView
		? homePagePreferenceName
		: `${ JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE }-${ bannerKey }`;
	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );
	const homePagePreference = useSelector( ( state ) =>
		getPreference( state, homePagePreferenceName )
	);

	const savePreferenceType = useCallback(
		( type: PreferenceType ) => {
			dispatch( savePreference( preferenceName, { ...preference, [ type ]: true } ) );
		},
		[ dispatch, preference, preferenceName ]
	);

	const handleTrackEvents = useCallback(
		( eventName: string ) => {
			dispatch( recordTracksEvent( eventName ) );
		},
		[ dispatch ]
	);

	const isDismissed = preference?.dismiss;
	const hideBanner = ! isDashboardView && homePagePreference?.view;

	useEffect( () => {
		if ( ! isDismissed && ! hideBanner ) {
			savePreferenceType( 'view' );
			handleTrackEvents(
				isDashboardView
					? 'calypso_jetpack_agency_dashboard_home_page_banner_view'
					: 'calypso_jetpack_agency_dashboard_other_page_banner_view'
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const trackViewEvent = () => {
		handleTrackEvents( 'calypso_jetpack_agency_dashboard_other_page_banner_view_dashboard_click' );
	};

	const dismissBanner = useCallback( () => {
		savePreferenceType( 'dismiss' );
		handleTrackEvents(
			isDashboardView
				? 'calypso_jetpack_agency_dashboard_home_page_banner_dismiss_click'
				: 'calypso_jetpack_agency_dashboard_other_page_banner_dismiss_click'
		);
	}, [ handleTrackEvents, isDashboardView, savePreferenceType ] );

	// Hide the banner if the banner is already viewed
	// on the dashboard page or the banner is dismissed
	if ( isDismissed || hideBanner ) {
		return null;
	}

	return (
		<Banner
			title={ translate( 'A new way to manage all your Jetpack sites in one spot' ) }
			description={
				isDashboardView
					? translate(
							'Manage features and discover issues with any of your sites, which are automatically added when Jetpack is connected.'
					  )
					: translate(
							'Manage features and discover issues with any of your sites within your new dashboard.'
					  )
			}
			disableCircle
			horizontal
			iconPath={ tipIcon }
			callToAction={ isDashboardView ? translate( 'Got it' ) : translate( 'View' ) }
			href={ isDashboardView ? '' : '/dashboard' }
			onClick={ isDashboardView ? dismissBanner : trackViewEvent }
			dismissTemporary={ ! isDashboardView }
			onDismiss={ dismissBanner }
			disableHref={ isDashboardView }
			dismissPreferenceName={ isDashboardView ? '' : preferenceName }
		/>
	);
}
