import { Button, Spinner, Modal } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { ButtonStack } from '../../../../../components/button-stack';

const BACKUP_RETENTION_UPDATE_REQUEST = {
	UNSUBMITTED: 'unsubmitted',
	PENDING: 'pending',
	SUCCESS: 'success',
	FAILED: 'failed',
} as const;

interface RetentionConfirmationDialogProps {
	confirmationDialogVisible: boolean;
	retentionSelected: number;
	disableFormSubmission?: boolean;
	updateRetentionRequestStatus: string;
	onClose: () => void;
	onConfirmation: () => void;
}

const RetentionConfirmationDialog: React.FC< RetentionConfirmationDialogProps > = ( {
	confirmationDialogVisible,
	retentionSelected,
	disableFormSubmission,
	updateRetentionRequestStatus,
	onClose,
	onConfirmation,
} ) => {
	return (
		confirmationDialogVisible && (
			<Modal title={ __( 'Update settings' ) } onRequestClose={ onClose }>
				<>
					<p>
						{ sprintf(
							/* Translators: %(retentionDays)s is a number which represents the number of days a backup will be "retained"/made available for restoration */
							__(
								'You are about to reduce the number of days your backups are being saved. Backups older than %(retentionDays)s days will be lost.'
							),
							{ retentionDays: retentionSelected }
						) }
					</p>
					<ButtonStack>
						<Button key="cancel" onClick={ onClose }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							key="confirm"
							onClick={ onConfirmation }
							variant="primary"
							disabled={ disableFormSubmission }
						>
							{ updateRetentionRequestStatus !== BACKUP_RETENTION_UPDATE_REQUEST.PENDING ? (
								__( 'Confirm change' )
							) : (
								<Spinner />
							) }
						</Button>
					</ButtonStack>
				</>
			</Modal>
		)
	);
};

export default RetentionConfirmationDialog;
