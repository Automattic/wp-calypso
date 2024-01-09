import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';

import '../style.scss';

export default function EnableMonitorTourStep1() {
	const translate = useTranslate();
	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderEnableMonitorTourStep1 = urlParams.get( 'tour' ) === 'enable-monitor';

	return (
		shouldRenderEnableMonitorTourStep1 && (
			<GuidedTour
				className="onboarding-tours__guided-tour"
				preferenceName={ JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'enableMonitorStep1' ] }
				tours={ [
					{
						target: '.dashboard-bulk-actions__edit-button',
						popoverPosition: 'bottom left',
						title: translate( 'Bulk editing' ),
						description: (
							<>
								{ translate(
									"Looking to manage multiple sites efficiently? Click the 'Edit All' button."
								) }
							</>
						),
						nextStepOnTargetClick: '.dashboard-bulk-actions__edit-button',
					},
					{
						target: '.dashboard-bulk-actions__custom_notification_button',
						popoverPosition: 'bottom left',
						title: translate( 'Set up Custom Notifications' ),
						description: (
							<>
								{ translate( 'Here are the notification settings for Uptime Monitoring.' ) }
								<br />
								<br />
								{ translate(
									'All sites are auto-selected; feel free to deselect any you prefer to exclude.'
								) }
							</>
						),

						nextStepOnTargetClick: '.dashboard-bulk-actions__custom_notification_button',
					},
				] }
				hideSteps
			/>
		)
	);
}
