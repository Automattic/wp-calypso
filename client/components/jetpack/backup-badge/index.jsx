import { Badge, ScreenReaderText } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { getBackupWarnings } from 'calypso/lib/jetpack/backup-utils';
import { useLatestBackupAttempt } from 'calypso/my-sites/backup/status/hooks';

const BackupBadge = ( { siteId } ) => {
	const translate = useTranslate();
	const lastAttemptOnDate = useLatestBackupAttempt( siteId, {
		after: moment( 'today' ).startOf( 'day' ),
		before: moment( 'today' ).endOf( 'day' ),
	} );

	let numWarningCache = null;

	const numBackupWarnings = ( backup ) => {
		if ( numWarningCache !== null ) {
			return numWarningCache;
		}

		let numWarnings = 0;

		const backupWarnings = getBackupWarnings( backup );
		if ( ! backupWarnings ) {
			return numWarnings;
		}

		Object.keys( backupWarnings ).forEach( ( key ) => {
			if ( backupWarnings[ key ].items ) {
				numWarnings += backupWarnings[ key ].items.length;
			}
		} );

		numWarningCache = numWarnings;
		return numWarnings;
	};

	if ( lastAttemptOnDate.isLoading || numBackupWarnings( lastAttemptOnDate.backupAttempt ) === 0 ) {
		return <></>;
	}

	return (
		<Badge type="warning">
			<span aria-hidden="true">
				{ translate(
					'%(number)d {{span}}warning{{/span}}',
					'%(number)d {{span}}warnings{{/span}}',
					{
						count: numBackupWarnings( lastAttemptOnDate.backupAttempt ),
						args: {
							number: numBackupWarnings( lastAttemptOnDate.backupAttempt ),
						},
						components: {
							span: <span className="backup-badge__words" />,
						},
					}
				) }
			</span>
			<ScreenReaderText>
				{ translate( '%(number)d warning', '%(number)d warnings', {
					count: numBackupWarnings( lastAttemptOnDate.backupAttempt ),
					args: {
						number: numBackupWarnings( lastAttemptOnDate.backupAttempt ),
					},
				} ) }
			</ScreenReaderText>
		</Badge>
	);
};

export default BackupBadge;
