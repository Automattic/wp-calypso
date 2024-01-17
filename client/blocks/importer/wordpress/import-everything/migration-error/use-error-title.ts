import { MigrationStatusError } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';

export default function useErrorTitle( status: MigrationStatusError ) {
	const translate = useTranslate();

	const generateTitle = useCallback( () => {
		switch ( status ) {
			// Start of migration #1
			case MigrationStatusError.ACTIVATE_REWIND:
			case MigrationStatusError.BACKUP_QUEUEING:
				return translate( 'Impossible to start the import.' );

			// Start of backup
			// eslint-disable-next-line inclusive-language/use-inclusive-words
			case MigrationStatusError.MISSING_SOURCE_MASTER_USER:
				return translate( 'Impossible to start the backup.' );

			// During backup
			case MigrationStatusError.NO_BACKUP_STATUS:
			case MigrationStatusError.BACKUP_SITE_NOT_ACCESSIBLE:
			case MigrationStatusError.BACKUP_UNKNOWN:
				return translate( 'There was an error during the backup.' );

			// End of backup #1
			case MigrationStatusError.WOA_GET_TRANSFER_RECORD:
			case MigrationStatusError.MISSING_WOA_CREDENTIALS:
				return translate( 'There was an error during the backup.' );

			// Start of restore
			case MigrationStatusError.RESTORE_QUEUE:
			case MigrationStatusError.RESTORE_FAILED:
				return translate( 'There was an error to start the restore.' );

			// During restore
			case MigrationStatusError.RESTORE_STATUS:
				return translate( 'There was an error during the restore.' );

			// End of restore
			case MigrationStatusError.FIX_EXTERNAL_USER_ID:
			case MigrationStatusError.GET_SOURCE_EXTERNAL_USER_ID:
			case MigrationStatusError.GET_USER_TOKEN:
			case MigrationStatusError.UPDATE_TARGET_USER_TOKEN:
				return translate( 'There was an error at the end of the restore.' );

			// Start of migration #2
			// End of backup #2
			case MigrationStatusError.WOA_TRANSFER:
				return translate( 'Impossible to perform the import.' );

			// Miscellaneous
			case MigrationStatusError.GENERAL:
			case MigrationStatusError.UNKNOWN:
			default:
				return translate( 'There was an error with your import.' );
		}
	}, [ status ] );

	const [ title, setTitle ] = useState( generateTitle() );

	useEffect( () => setTitle( generateTitle() ), [ generateTitle ] );

	return title;
}
