import { MigrationStatusError } from '@automattic/data-stores';
import { createElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useEffect, useState } from 'react';

export default function useErrorDetails( status: MigrationStatusError | null ) {
	const translate = useTranslate();

	const [ title, setTitle ] = useState< string | ReactNode >( '' );
	const [ goBackCta, showGoBackCta ] = useState( false );
	const [ getHelpCta, showGetHelpCta ] = useState( false );
	const [ tryAgainCta, showTryAgainCta ] = useState( false );

	const handleDetails = useCallback( () => {
		switch ( status ) {
			// Start of migration #1
			case MigrationStatusError.ACTIVATE_REWIND:
			case MigrationStatusError.BACKUP_QUEUEING:
				setTitle( translate( 'Impossible to start the import.' ) );
				break;

			// Start of backup
			// eslint-disable-next-line inclusive-language/use-inclusive-words
			case MigrationStatusError.MISSING_SOURCE_MASTER_USER:
				setTitle( translate( 'Impossible to start the backup.' ) );
				break;

			// During backup
			case MigrationStatusError.NO_BACKUP_STATUS:
			case MigrationStatusError.BACKUP_SITE_NOT_ACCESSIBLE:
			case MigrationStatusError.BACKUP_UNKNOWN:
				setTitle( translate( 'There was an error during the backup.' ) );
				break;

			// End of backup #1
			case MigrationStatusError.WOA_GET_TRANSFER_RECORD:
			case MigrationStatusError.MISSING_WOA_CREDENTIALS:
				setTitle( translate( 'There was an error during the backup.' ) );
				break;

			// Start of restore
			case MigrationStatusError.RESTORE_QUEUE:
			case MigrationStatusError.RESTORE_FAILED:
				setTitle( translate( 'There was an error to start the restore.' ) );
				break;

			// During restore
			case MigrationStatusError.RESTORE_STATUS:
				setTitle( translate( 'There was an error during the restore.' ) );
				break;

			// End of restore
			case MigrationStatusError.FIX_EXTERNAL_USER_ID:
			case MigrationStatusError.GET_SOURCE_EXTERNAL_USER_ID:
			case MigrationStatusError.GET_USER_TOKEN:
			case MigrationStatusError.UPDATE_TARGET_USER_TOKEN:
				setTitle( translate( 'There was an error at the end of the restore.' ) );
				break;

			// Start of migration #2
			// End of backup #2
			case MigrationStatusError.WOA_TRANSFER:
				setTitle( translate( 'Impossible to perform the import.' ) );
				break;

			// Miscellaneous
			case MigrationStatusError.GENERAL:
			case MigrationStatusError.UNKNOWN:
			default:
				setTitle(
					translate(
						'There was an error with your import.{{br}}{{/br}}Please try again soon or contact support for help.',
						{
							components: {
								br: createElement( 'br' ),
							},
						}
					)
				);
				showGoBackCta( false );
				showGetHelpCta( true );
				showTryAgainCta( true );
				break;
		}
	}, [ status ] );

	useEffect( () => {
		handleDetails();
	}, [ handleDetails ] );

	return { title, goBackCta, getHelpCta, tryAgainCta };
}
