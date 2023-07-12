import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import tipIcon from 'calypso/assets/images/jetpack/tip-icon.svg';
import Banner from 'calypso/components/banner';

export default function SiteDowntimeMonitoringPaidTierBanner() {
	const translate = useTranslate();

	const isDowntimeMonitoringPaidTierEnabled = isEnabled(
		'jetpack/pro-dashboard-monitor-paid-tier'
	);

	if ( ! isDowntimeMonitoringPaidTierEnabled ) {
		return null;
	}

	// TODO: This is a temporary banner for feature flag demo only. We will need to update this with proper implementation.
	return (
		<Banner
			title={ translate( 'Your uptime, our priority: enhanced Downtime Monitoring' ) }
			description={ translate(
				'Maximise uptime with our swift 1-minute interval alerts, now supporting multi-emails and SMS notifications.'
			) }
			disableCircle
			horizontal
			iconPath={ tipIcon }
			callToAction={ translate( 'Explore' ) }
			href=""
		/>
	);
}
