import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';
import { JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME } from '../constants';
import ResetTour from '../reset-tour';

import '../style.scss';

export default function AddNewSiteTourStep1() {
	const translate = useTranslate();
	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderAddSiteTourStep1 = urlParams.get( 'tour' ) === 'add-new-site';

	if ( shouldRenderAddSiteTourStep1 ) {
		ResetTour( 'addSiteStep', [ 'addSiteStep1', 'addSiteStep2' ] );
		window.localStorage.removeItem( 'Jetpack_Manage_Preference_Reset_addSiteStep' );
	}

	return (
		shouldRenderAddSiteTourStep1 && (
			<GuidedTour
				className="onboarding-tours__guided-tour"
				preferenceName={ JETPACK_MANAGE_ONBOARDING_TOURS_PREFERENCE_NAME[ 'addSiteStep1' ] }
				tours={ [
					{
						target: '#sites-overview-add-sites-button .split-button__toggle',
						popoverPosition: 'bottom left',
						title: translate( 'Click the arrow button' ),
						description: (
							<>
								{ translate( 'Click the arrow button and select "Connect a site to Jetpack".' ) }
								<br />
								<br />
								{ translate(
									'Sites with Jetpack installed will automatically appear in the site management view.'
								) }
							</>
						),

						nextStepOnTargetClick: '#sites-overview-add-sites-button .split-button__toggle',
					},
				] }
			/>
		)
	);
}
