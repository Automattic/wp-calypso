import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useEffect } from 'react';
import CelebrationIcon from 'calypso/assets/images/jetpack/celebration-icon.svg';
import Banner from 'calypso/components/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_BANNER_PREFERENCE,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import SitesOverviewContext from '../context';
import { PreferenceType } from '../types';

import './style.scss';

export default function SiteDowntimeMonitoringUpgradeBanner() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { showLicenseInfo } = useContext( SitesOverviewContext );

	const preferenceName = JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_BANNER_PREFERENCE;

	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );

	const isDismissed = preference?.dismiss;
	const viewDate = preference?.view_date;

	const savePreferenceType = useCallback(
		( type: PreferenceType, value: boolean | number ) => {
			dispatch( savePreference( preferenceName, { ...preference, [ type ]: value } ) );
		},
		[ dispatch, preference, preferenceName ]
	);

	const isDowntimeMonitoringPaidTierEnabled = isEnabled(
		'jetpack/pro-dashboard-monitor-paid-tier'
	);

	useEffect( () => {
		if ( isDowntimeMonitoringPaidTierEnabled && ! isDismissed && ! viewDate ) {
			savePreferenceType( 'view_date', Date.now() );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_agency_dashboard_monitor_upgrade_banner_view' )
			);
		}
		// We only want to run this once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	if ( ! isDowntimeMonitoringPaidTierEnabled || isDismissed ) {
		return null;
	}

	const dismissAndRecordEvent = ( eventName: string, showInfoAfterDismiss = false ) => {
		savePreferenceType( 'dismiss', true );
		dispatch( recordTracksEvent( `calypso_jetpack_agency_dashboard_${ eventName }` ) );

		if ( showInfoAfterDismiss ) {
			showLicenseInfo( 'monitor' );
		}
	};

	return (
		<Banner
			className="site-downtime-monitoring-upgrade-banner"
			title={ translate( 'Your uptime, our priority: enhanced Downtime Monitoring' ) }
			description={ translate(
				'Maximize uptime with our swift 1-minute interval alerts, now supporting multi-emails and SMS notifications.'
			) }
			disableCircle
			horizontal
			iconPath={ CelebrationIcon }
			callToAction={ translate( 'Explore' ) }
			dismissWithoutSavingPreference
			onClick={ () => dismissAndRecordEvent( 'monitor_upgrade_banner_accept', true ) }
			onDismiss={ () => dismissAndRecordEvent( 'monitor_upgrade_banner_dismiss' ) }
		/>
	);
}
