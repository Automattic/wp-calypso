import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AmplifyReportCreator from './report-creator';
import type { AmplifyUsageStatus } from './usage';
import type { AgencyTierId, AmplifyMode, AmplifyUsage } from '@automattic/api-core';

export default function AmplifyNewReportModal( {
	agencyId,
	initialUrl,
	initialMode,
	canScan,
	usage,
	usageStatus,
	tierId,
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
	tierId?: AgencyTierId;
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
				tierId={ tierId }
				isModal
				onCreated={ onCreated }
				onUsageError={ onUsageError }
			/>
		</Modal>
	);
}
