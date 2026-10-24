import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AmplifyReportCreator from './report-creator';
import type { AmplifyMode, AmplifyUsage } from '@automattic/api-core';

export default function AmplifyNewReportModal( {
	agencyId,
	initialUrl,
	initialMode,
	usage,
	onClose,
	onCreated,
}: {
	agencyId: number;
	initialUrl?: string;
	initialMode?: AmplifyMode;
	usage?: AmplifyUsage;
	onClose: () => void;
	onCreated: () => void;
} ) {
	return (
		<Modal
			title={ __( 'New report' ) }
			size="large"
			className="dashboard-amplify-new-report-modal"
			onRequestClose={ onClose }
		>
			<AmplifyReportCreator
				agencyId={ agencyId }
				initialUrl={ initialUrl }
				initialMode={ initialMode }
				usage={ usage }
				isModal
				onCreated={ onCreated }
			/>
		</Modal>
	);
}
