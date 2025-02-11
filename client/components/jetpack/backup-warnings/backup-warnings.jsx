import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ExternalLink from 'calypso/components/external-link';
import BackupWarningHeader from 'calypso/components/jetpack/backup-warnings/backup-warning-header';
import BackupWarningListHeader from 'calypso/components/jetpack/backup-warnings/backup-warning-list-header';
import LogItem from 'calypso/components/jetpack/log-item';
import { getBackupWarnings } from 'calypso/lib/jetpack/backup-utils';

import './style.scss';

// If code specific info doesn't exist, fall back to category
const getWarningInfo = ( code, category ) => {
	const warningCategoryInfo = {
		GENERIC: translate(
			'You can wait for the new backup to run tomorrow, or trigger a new backup by clicking the "Retry" button.'
		),
		PERMISSIONS: translate(
			'Ensure your SFT/SSH/FTP username has {{ExternalLink}}full permissions{{/ExternalLink}} to the listed files. You can wait for the new backup to run tomorrow, or trigger a new backup by clicking the "Retry" button.',
			{
				components: {
					ExternalLink: (
						<ExternalLink
							href="https://jetpack.com/support/backup/backups-via-the-jetpack-plugin/adding-credentials-to-jetpack/#file-access-permissions"
							target="_blank"
						/>
					),
				},
			}
		),
		CONNECTION: translate(
			'Looks like your connection was interrupted. Ensure your site is accessible and the {{ExternalLink}}server credentials{{/ExternalLink}} are correct. You can wait for the new backup to run tomorrow, or trigger a new backup by clicking the "Retry" button.',
			{
				components: {
					ExternalLink: (
						<ExternalLink
							href="https://jetpack.com/support/backup/backups-via-the-jetpack-plugin/adding-credentials-to-jetpack/"
							target="_blank"
						/>
					),
				},
			}
		),
		TRANSIENT: translate(
			'You can fix transient file errors by adding a {{ExternalLink}}donotbackup folder{{/ExternalLink}} and moving the files listed to it. You can wait for the new backup to run tomorrow, or trigger a new backup by clicking the "Retry" button.',
			{
				components: {
					ExternalLink: (
						<ExternalLink
							href="https://jetpack.com/support/backup/backups-via-the-jetpack-plugin/#frequently-asked-questions"
							target="_blank"
						/>
					),
				},
			}
		),
		DATABASE: translate(
			'Ensure your database credentials have {{ExternalLink}}proper access to your database{{/ExternalLink}} and your tables are not corrupt. You can wait for the new backup to run tomorrow, or trigger a new backup by clicking the "Retry" button.',
			{
				components: {
					ExternalLink: (
						<ExternalLink
							href="https://jetpack.com/blog/error-establishing-database-connection-on-wordpress/"
							target="_blank"
						/>
					),
				},
			}
		),
	};

	const warningCodeInfo = {
		// Generic - Anything with an undefined code
		GENERIC: null,

		// Permissions
		PERMISSION_DENIED: null,
		UNABLE_TO_OPEN_FILE: null,

		// Connection
		SERIOUS_ROW_COUNT_MISMATCH: null,
		TIMEOUT: null,
		UNABLE_TO_CONNECT_TO_ANY_TARGET: null,
		UNABLE_TO_START_SUBSYSTEM: null,
		CONNECTION_REFUSED: null,
		NO_RESPONSE_FROM_SERVER: null,
		CONNECTION_ERROR_CODE_SSH: null,
		TRANSPORT_SERVER_API_TIMED_OUT: null,
		HTTP_ERROR_4XX_CLIENT_ERROR: null,
		HTTP_ERROR_408_REQUEST_TIMEOUT: null,
		HTTP_ERROR_5XX_SERVER_ERROR: null,
		HTTP_ERROR_502_BAD_GATEWAY: null,
		HTTP_ERROR_503_SERVICE_UNAVAILABLE: null,
		HTTP_ERROR_520_EMPTY_OR_UNEXPECTED_ERROR: null,
		HTTP_ERROR_524_TIMEOUT_OCCURRED: null,

		// Transient
		FILE_NOT_FOUND: null,
		DOWNLOADED_FILE_HAS_BAD_SIZE: null,
		NO_SUCH_FILE: null,
		HTTP_ERROR_3XX_REDIRECTION: null,
		HTTP_ERROR_302_FOUND: null,

		// Database
		SELECT_COMMAND_DENIED_TO_USER: null,
		TABLE_MARKED_AS_CRASHED: null,
		TABLE_MARKED_AS_CRASHED_LAST_REPAIR_FAILED: null,
	};

	let warningInfo = warningCategoryInfo.GENERIC;

	if ( warningCodeInfo.hasOwnProperty( code ) && warningCodeInfo[ code ] !== null ) {
		warningInfo = warningCodeInfo[ code ];
	} else if (
		warningCategoryInfo.hasOwnProperty( category ) &&
		warningCategoryInfo[ category ] !== null
	) {
		warningInfo = warningCategoryInfo[ category ];
	}

	return warningInfo;
};

const BackupWarnings = ( { lastBackupAttemptOnDate } ) => {
	if ( ! lastBackupAttemptOnDate ) {
		return <></>;
	}

	const backup = lastBackupAttemptOnDate;

	const warnings = getBackupWarnings( backup );
	const hasWarnings = Object.keys( warnings ).length !== 0;

	if ( ! hasWarnings ) {
		return <></>;
	}

	const logItems = [];
	Object.keys( warnings ).forEach( ( warningCode ) => {
		const fileList = [];
		warnings[ warningCode ].items.forEach( ( item ) => {
			fileList.push( <li key={ item.item }> { item.item } </li> );
		} );
		logItems.push(
			<LogItem
				key={ warningCode }
				className="backup-warnings__warning-item"
				header={
					<BackupWarningHeader warning={ warnings[ warningCode ] } warningCode={ warningCode } />
				}
				onOpen={ () => recordTracksEvent( 'calypso_jetpack_backup_expand_warning_click' ) }
			>
				<ul className="backup-warnings__file-list">{ fileList }</ul>
				<div className="backup-warnings__info">
					<Gridicon icon="help-outline" />
					<div className="backup-warnings__info-text">
						{ getWarningInfo( warningCode, warnings[ warningCode ].category ) }
					</div>
				</div>
			</LogItem>
		);
	} );

	return (
		<>
			<BackupWarningListHeader />
			{ logItems }
		</>
	);
};

BackupWarnings.propTypes = {
	backup: PropTypes.object,
};

export default BackupWarnings;
