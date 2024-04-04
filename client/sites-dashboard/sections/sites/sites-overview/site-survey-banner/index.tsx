import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Banner from 'calypso/components/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_DASHBOARD_SURVEY_BANNER_PREFERENCE,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { PreferenceType } from '../types';

import './style.scss';

interface Props {
	isDashboardView?: boolean;
}

export default function SiteSurveyBanner( { isDashboardView }: Props ) {
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

	const dismissAndRecordEvent = ( eventName: string ) => {
		savePreferenceType( 'dismiss' );

		const eventNamePrefix = isDashboardView
			? 'calypso_jetpack_agency_dashboard_'
			: 'calypso_partner_portal_';

		dispatch( recordTracksEvent( eventNamePrefix + eventName ) );
	};

	// This survey is only available in English only.
	const isEnglishLocale = getLocaleSlug() === 'en' || getLocaleSlug() === 'en-gb';

	if ( isDismissed || ! isEnglishLocale ) {
		return null;
	}

	return (
		<Banner
			className="site-survey-banner"
			title={ translate( 'Help Jetpack build better products for you' ) }
			description={ translate(
				'Take this 2 minute survey to help us understand your needs & build products that deliver more value to your clients.'
			) }
			callToAction={ translate( 'Take survey' ) }
			href="https://automattic.survey.fm/agency-partnership-usage-survey"
			target="_blank"
			jetpack
			dismissWithoutSavingPreference
			horizontal
			onClick={ () => dismissAndRecordEvent( 'survey_banner_accept' ) }
			onDismiss={ () => dismissAndRecordEvent( 'survey_banner_dismiss' ) }
		/>
	);
}
