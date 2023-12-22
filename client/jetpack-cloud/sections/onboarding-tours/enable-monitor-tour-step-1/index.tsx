import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';

export default function EnableMonitorTourStep1() {
	const translate = useTranslate();
	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderEnableMonitorTourStep1 = urlParams.get( 'tour' ) === 'enable-monitor';

	return (
		shouldRenderEnableMonitorTourStep1 && (
			<GuidedTour
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
				] }
			/>
		)
	);
}
