import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	isLoading: boolean;
	validationError?: string;
	isBulkUpdate: boolean;
	handleOnClose: () => void;
	hasUnsavedChanges: boolean;
	unsavedChangesExist: boolean;
}

export default function NotificationSettingsFormFooter( {
	isLoading,
	validationError,
	isBulkUpdate,
	handleOnClose,
	hasUnsavedChanges,
	unsavedChangesExist,
}: Props ) {
	const translate = useTranslate();

	return (
		<div className="notification-settings__footer">
			{ ( validationError || hasUnsavedChanges ) && (
				<div className="notification-settings__footer-validation-error" role="alert">
					{ hasUnsavedChanges
						? translate( 'You have unsaved changes. Are you sure you want to close?' )
						: validationError }
				</div>
			) }
			<div className="notification-settings__footer-buttons">
				<Button
					onClick={ handleOnClose }
					aria-label={ translate( 'Cancel and close notification settings popup' ) }
				>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					disabled={
						// Disable save button if there is no change and not bulk update
						!! validationError || isLoading || ( ! isBulkUpdate && ! unsavedChangesExist )
					}
					type="submit"
					primary
					aria-label={ translate( 'Save notification settings' ) }
				>
					{ isLoading ? translate( 'Saving Changes' ) : translate( 'Save' ) }
				</Button>
			</div>
		</div>
	);
}
