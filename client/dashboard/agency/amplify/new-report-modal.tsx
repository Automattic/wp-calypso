import { startAmplifyReportMutation } from '@automattic/api-queries';
import { useIsMutating } from '@tanstack/react-query';
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import AmplifyReportCreator from './report-creator';
import type { AmplifyTiersLink } from './types';
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
	tiersLink,
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
	tiersLink?: AmplifyTiersLink;
	onClose: () => void;
	onCreated: () => void;
	onUsageError?: ( code: string ) => void;
} ) {
	const isStarting =
		useIsMutating( { mutationKey: startAmplifyReportMutation( agencyId ).mutationKey } ) > 0;
	return (
		<Modal
			title={ __( 'New report' ) }
			isDismissible={ ! isStarting }
			shouldCloseOnEsc={ ! isStarting }
			shouldCloseOnClickOutside={ ! isStarting }
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
				tiersLink={ tiersLink }
				isModal
				onCreated={ onCreated }
				onUsageError={ onUsageError }
			/>
		</Modal>
	);
}
