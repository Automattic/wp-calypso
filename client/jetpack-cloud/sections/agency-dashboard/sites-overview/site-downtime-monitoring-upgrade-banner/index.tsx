import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import CelebrationIcon from 'calypso/assets/images/jetpack/celebration-icon.svg';
import Banner from 'calypso/components/banner';
import { useDispatch, useSelector } from 'calypso/state';
import {
	JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_BANNER_PREFERENCE,
	getJetpackDashboardPreference as getPreference,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { PreferenceType } from '../types';

import './style.scss';

export default function SiteDowntimeMonitoringUpgradeBanner() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const preferenceName = JETPACK_DASHBOARD_DOWNTIME_MONITORING_UPGRADE_BANNER_PREFERENCE;

	const preference = useSelector( ( state ) => getPreference( state, preferenceName ) );

	const isDismissed = preference?.dismiss;

	const savePreferenceType = useCallback(
		( type: PreferenceType ) => {
			dispatch( savePreference( preferenceName, { ...preference, [ type ]: true } ) );
		},
		[ dispatch, preference, preferenceName ]
	);

	const isDowntimeMonitoringPaidTierEnabled = isEnabled(
		'jetpack/pro-dashboard-monitor-paid-tier'
	);

	if ( ! isDowntimeMonitoringPaidTierEnabled || isDismissed ) {
		return null;
	}

	const dismissAndRecordEvent = () => {
		savePreferenceType( 'dismiss' );

		// TODO: We need to record event here
	};

	return (
		<Banner
			className="site-downtime-monitoring-upgrade-banner"
			title={ translate( 'Your uptime, our priority: enhanced Downtime Monitoring' ) }
			description={ translate(
				'Maximise uptime with our swift 1-minute interval alerts, now supporting multi-emails and SMS notifications.'
			) }
			disableCircle
			horizontal
			iconPath={ CelebrationIcon }
			callToAction={ translate( 'Explore' ) }
			dismissWithoutSavingPreference
			href="" // TODO: We will need to provide link to the info modal here
			onClick={ () => dismissAndRecordEvent() }
			onDismiss={ () => dismissAndRecordEvent() }
		/>
	);
}
