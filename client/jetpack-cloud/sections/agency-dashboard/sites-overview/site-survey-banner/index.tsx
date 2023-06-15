import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Banner from 'calypso/components/banner';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_DASHBOARD_SURVEY_BANNER_PREFERENCE,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { PreferenceType } from '../types';

const SiteSurveyBanner = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const preferenceName = JETPACK_DASHBOARD_SURVEY_BANNER_PREFERENCE;

	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );

	const isDismissed = preference?.dismiss;

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

	const onDismiss = useCallback( () => {
		savePreferenceType( 'dismiss' );
		handleTrackEvents( 'calypso_jetpack_agency_dashboard_survey_banner_dismiss_click' );
	}, [ handleTrackEvents, savePreferenceType ] );

	if ( isDismissed ) {
		return null;
	}

	return (
		<Banner
			className="site-survey-banner"
			title={ translate( 'Help Jetpack build better products for you' ) }
			description={ translate(
				'Take this 2 minute survey to help us understand your needs & build products that delivers more value to your clients.'
			) }
			callToAction={ translate( 'Take survey' ) }
			href="https://automattic.survey.fm/agency-partnership-usage-survey"
			jetpack
			dismissWithoutSavingPreference
			horizontal
			onDismiss={ onDismiss }
		/>
	);
};

export default SiteSurveyBanner;
