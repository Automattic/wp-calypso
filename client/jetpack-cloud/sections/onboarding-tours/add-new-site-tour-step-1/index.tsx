import { useTranslate } from 'i18n-calypso';
import GuidedTour from 'calypso/jetpack-cloud/components/guided-tour';

export default function AddNewSiteTourStep1() {
	const translate = useTranslate();
	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderAddSiteTourStep1 = urlParams.get( 'tour' ) === 'add-new-site';

	return (
		shouldRenderAddSiteTourStep1 && (
			<GuidedTour
				className="jetpack-cloud-site-dashboard__guided-tour"
				preferenceName="jetpack-cloud-site-dashboard-add-new-site-tour-step-1"
				tours={ [
					{
						target: '#sites-overview-add-sites-button .split-button__toggle',
						popoverPosition: 'bottom left',
						title: translate( 'Press on an arrow button' ),
						description: (
							<>
								{ translate( 'Click the arrow button and select "Connect a site to Jetpack".' ) }
								<br />
								<br />
								{ translate(
									'Sites with jetpack installed will automatically appear in the site management view.'
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
