import { Button, Dialog, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { BACKUP_RETENTION_UPDATE_REQUEST } from 'calypso/state/rewind/retention/constants';
import './style.scss';

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
	const translate = useTranslate();

	return (
		<Dialog
			additionalClassNames="retention-confirmation-dailog__dialog"
			isVisible={ confirmationDialogVisible }
			onClose={ onClose }
			buttons={ [
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>,
				<Button onClick={ onConfirmation } primary disabled={ disableFormSubmission }>
					{ updateRetentionRequestStatus !== BACKUP_RETENTION_UPDATE_REQUEST.PENDING ? (
						translate( 'Confirm change' )
					) : (
						<Spinner size={ 22 } />
					) }
				</Button>,
			] }
		>
			<h3>{ translate( 'Update settings' ) }</h3>
			<p>
				{ translate(
					'You are about to reduce the number of days your backups are being saved. Backups older than %(retentionDays)s days will be lost.',
					{
						args: { retentionDays: retentionSelected },
					}
				) }
			</p>
		</Dialog>
	);
};

export default RetentionConfirmationDialog;
