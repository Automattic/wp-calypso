import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AmplifyReportCreator from './report-creator';
import type { AmplifyUsageStatus } from './usage';
import type { AmplifyMode, AmplifyUsage } from '@automattic/api-core';

export default function AmplifyNewReportModal( {
	agencyId,
	initialUrl,
	initialMode,
	canScan,
	usage,
	usageStatus,
	limitNotice,
	onClose,
	onCreated,
	onUsageError,
}: {
	agencyId: number;
	initialUrl?: string;
	initialMode?: AmplifyMode;
	canScan?: boolean;
	usage?: AmplifyUsage;
	usageStatus?: AmplifyUsageStatus;
	limitNotice?: React.ReactNode;
	onClose: () => void;
	onCreated: () => void;
	onUsageError?: ( code: string ) => void;
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
				canScan={ canScan }
				usage={ usage }
				usageStatus={ usageStatus }
				limitNotice={ limitNotice }
				isModal
				onCreated={ onCreated }
				onUsageError={ onUsageError }
			/>
		</Modal>
	);
}
