import { ScreenReaderText } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { getBackupWarnings } from 'calypso/lib/jetpack/backup-utils';
import { useDailyBackupStatus } from 'calypso/my-sites/backup/status/hooks';

const BackupBadge = ( { siteId } ) => {
	const translate = useTranslate();
	const backupStatus = useDailyBackupStatus( siteId, 'today' );

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

	if ( backupStatus.isLoading || numBackupWarnings( backupStatus.lastBackupAttemptOnDate ) === 0 ) {
		return <></>;
	}

	return (
		<Badge type="warning">
			<span aria-hidden="true">
				{ translate(
					'%(number)d {{span}}warning{{/span}}',
					'%(number)d {{span}}warnings{{/span}}',
					{
						count: numBackupWarnings( backupStatus.lastBackupAttemptOnDate ),
						args: {
							number: numBackupWarnings( backupStatus.lastBackupAttemptOnDate ),
						},
						components: {
							span: <span className="backup-badge__words" />,
						},
					}
				) }
			</span>
			<ScreenReaderText>
				{ translate( '%(number)d warning', '%(number)d warnings', {
					count: numBackupWarnings( backupStatus.lastBackupAttemptOnDate ),
					args: {
						number: numBackupWarnings( backupStatus.lastBackupAttemptOnDate ),
					},
				} ) }
			</ScreenReaderText>
		</Badge>
	);
};

export default BackupBadge;
