import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import commentIcon from 'calypso/assets/images/jetpack/block-post-comments.svg';
import Banner from 'calypso/components/banner';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_DASHBOARD_SURVEY_BANNER_PREFERENCE as preferenceName,
	JETPACK_DASHBOARD_WELCOME_BANNER_PREFERENCE_HOME_PAGE as homePagePreferenceName,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import type { PreferenceType } from '../types';

import './style.scss';

export default function SiteSurveyBanner() {
	const surveyHref = 'https://automattic.survey.fm/jetpack-pro-survey-hosting-needs';

	const translate = useTranslate();
	const dispatch = useDispatch();

	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );
	const homePagePreference = useSelector( ( state ) =>
		getPreference( state, homePagePreferenceName )
	);

	const savePreferenceType = useCallback(
		( type: PreferenceType ) => {
			dispatch( savePreference( preferenceName, { ...preference, [ type ]: true } ) );
		},
		[ dispatch, preference ]
	);

	const handleTrackEvent = useCallback(
		( eventName: string ) => {
			dispatch( recordTracksEvent( eventName ) );
		},
		[ dispatch ]
	);

	const dismissBanner = useCallback( () => {
		savePreferenceType( 'dismiss' );
		handleTrackEvent( 'calypso_jetpack_agency_dashboard_survey_banner_dismiss' );
	}, [ handleTrackEvent, savePreferenceType ] );

	const isDismissed = preference?.dismiss;
	const isWelcomeBannerDismissed = homePagePreference?.dismiss;
	const hideBanner = isDismissed || ! isWelcomeBannerDismissed;

	useEffect( () => {
		if ( ! hideBanner ) {
			savePreferenceType( 'view' );
			handleTrackEvent( 'calypso_jetpack_agency_dashboard_survey_banner_view' );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const trackClickEvent = () => {
		handleTrackEvent( 'calypso_jetpack_agency_dashboard_survey_banner_click' );

		// Dismiss banner but don't track "dismiss" event since we are automatically dismissing it after CTA click
		savePreferenceType( 'dismiss' );
	};

	// Hide the banner if it has already been dismissed or if the welcome banner is showing
	if ( hideBanner ) {
		return null;
	}

	return (
		<Banner
			className="dashboard__site-survey-banner"
			title={ translate( 'Interested in better hosting?' ) }
			description={ translate( 'Let us know what would make your ideal hosting experience.' ) }
			horizontal
			iconPath={ commentIcon }
			callToAction={ translate( 'Take our quick survey' ) }
			href={ surveyHref }
			onClick={ trackClickEvent }
			onDismiss={ dismissBanner }
			dismissPreferenceName={ preferenceName }
			target="_blank"
		/>
	);
}
