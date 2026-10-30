import { Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getFeatureName } from './constants';
import AmplifyOverviewStory from './overview-story';
import { AmplifyOverviewIntro } from './report-creator';

export default function AmplifyLearnMoreModal( { onClose }: { onClose: () => void } ) {
	/* translators: %s: feature name, e.g. "Prospect reports" */
	const aboutLabel = sprintf( __( 'About %s' ), getFeatureName() );
	return (
		<Modal title={ aboutLabel } size="large" onRequestClose={ onClose }>
			<div
				className="dashboard-amplify-overview"
				data-context="learn-more"
				aria-labelledby="dashboard-amplify-title"
			>
				<AmplifyOverviewIntro mode="full" />
				<AmplifyOverviewStory />
			</div>
		</Modal>
	);
}
