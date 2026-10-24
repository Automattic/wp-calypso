import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AmplifyOverviewStory from './overview-story';
import { AmplifyOverviewIntro } from './report-creator';

export default function AmplifyLearnMoreModal( { onClose }: { onClose: () => void } ) {
	return (
		<Modal
			contentLabel={ __( 'About Amplify' ) }
			size="large"
			className="dashboard-amplify-learn-more-modal"
			onRequestClose={ onClose }
		>
			<div
				className="dashboard-amplify-overview"
				data-context="learn-more"
				aria-labelledby="dashboard-amplify-title"
			>
				<AmplifyOverviewIntro mode="full" heroTitle={ __( 'About Amplify' ) } />
				<AmplifyOverviewStory />
			</div>
		</Modal>
	);
}
