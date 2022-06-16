import { translate } from 'i18n-calypso';
import BackupWarningTypeBadge from 'calypso/components/jetpack/backup-warnings/backup-warning-type-badge';

import './style.scss';

const warningCodeText = ( warningCode ) => {
	const typeMap = {
		SERIOUS_ROW_COUNT_MISMATCH: translate( 'Serious row count mismatch' ),
		SELECT_COMMAND_DENIED_TO_USER: translate( 'Select command denied to user' ),
		TABLE_MARKED_AS_CRASHED: translate( 'Table(s) marked as crashed' ),
		TABLE_MARKED_AS_CRASHED_LAST_REPAIR_FAILED: translate(
			'Table(s) marked as crashed - Last repair failed'
		),
		FILE_NOT_FOUND: translate( 'File(s) not found' ),
		DOWNLOADED_FILE_HAS_BAD_SIZE: translate( 'Downloaded file has bad size' ),
		PERMISSION_DENIED: translate( 'Permission denied' ),
		NO_SUCH_FILE: translate( 'No such file(s)' ),
		UNABLE_TO_OPEN_FILE: translate( 'Unable to open file(s)' ),
		TIMEOUT: translate( 'Connection timed out' ),
		UNABLE_TO_CONNECT_TO_ANY_TARGET: translate( 'Unable to connect to server' ),
		UNABLE_TO_START_SUBSYSTEM: translate( 'Unable to start subsystem' ),
		CONNECTION_REFUSED: translate( 'Connection refused' ),
		CONNECTION_ERROR_CODE_SSH: translate( 'SSH Connection Error' ),
		TRANSPORT_SERVER_API_TIMED_OUT: translate( 'Transport Server API Timeout' ),
		HTTP_ERROR_302_FOUND: translate( 'HTTP 302 Redirect' ),
		HTTP_ERROR_3XX_REDIRECTION: translate( 'HTTP 3XX Redirection' ),
		HTTP_ERROR_408_REQUEST_TIMEOUT: translate( 'HTTP 408 Request Timeout' ),
		HTTP_ERROR_4XX_CLIENT_ERROR: translate( 'HTTP 4XX Client Error' ),
		HTTP_ERROR_502_BAD_GATEWAY: translate( 'HTTP 502 Bad Gateway' ),
		HTTP_ERROR_503_SERVICE_UNAVAILABLE: translate( 'HTTP 503 Service Unavailable' ),
		HTTP_ERROR_520_EMPTY_OR_UNEXPECTED_ERROR: translate( 'HTTP 520 Empty or Unexpected Error' ),
		HTTP_ERROR_524_TIMEOUT_OCCURRED: translate( 'HTTP 524 Timeout Occurred' ),
		HTTP_ERROR_5XX_SERVER_ERROR: translate( 'HTTP 5XX Server Error' ),
		GENERIC: translate( 'Generic' ),
	};

	const warningText = typeMap[ warningCode ];

	return warningText ? warningText : typeMap.GENERIC;
};

const BackupWarningHeader = ( { warning, warningCode } ) => {
	return (
		<>
			<BackupWarningTypeBadge warningType={ warning.category } />
			<div className="backup-warning-header__titles">
				<div className="backup-warning-header__card-top">{ warningCodeText( warningCode ) }</div>
				<div className="backup-warning-header__card-bottom">
					{ warning.items.length } { translate( 'files affected' ) }
				</div>
			</div>
		</>
	);
};

export default BackupWarningHeader;
