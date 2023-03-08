import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import { useRealtimeBackupStatus } from 'calypso/my-sites/backup/status/hooks';
import ExpandedCard from './expanded-card';
import type { Site } from '../types';

interface Props {
	site: Site;
}

const BackupStorageContent = ( { siteId, siteUrl }: { siteId: number; siteUrl: string } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const selectedDate = useDateWithOffset( moment() );

	const { lastSuccessfulBackupOnDate, lastBackupAttemptOnDate, isLoading } =
		useRealtimeBackupStatus( siteId, selectedDate );

	const realtimeBackup = lastSuccessfulBackupOnDate || lastBackupAttemptOnDate;

	const lastBackupDate = useDateWithOffset( realtimeBackup?.activityTs );

	const getDisplayDate = useGetDisplayDate();
	const displayDate = getDisplayDate( lastBackupDate, false );

	const pluginName = [ 'plugin__activated', 'plugin__installed' ].includes(
		realtimeBackup?.activityName
	)
		? realtimeBackup?.activityDescription[ 0 ]?.children[ 0 ]
		: null;

	const backupTitle =
		realtimeBackup?.activityDescription[ 0 ]?.children[ 0 ]?.text ?? realtimeBackup?.activityTitle;

	const showLoader = isLoading || ! realtimeBackup;

	return (
		<div className="site-expanded-content__card-content-container">
			<div className="site-expanded-content__card-content">
				<div className="site-expanded-content__card-content-column">
					<div className="site-expanded-content__card-content-count">
						{ showLoader ? <TextPlaceholder /> : displayDate }
					</div>
					<div className="site-expanded-content__card-content-count-title">
						{ showLoader ? (
							<TextPlaceholder />
						) : (
							<>
								{ backupTitle
									? `${ backupTitle } ${ pluginName ? ` - ${ pluginName }` : '' }`
									: '' }
							</>
						) }
					</div>
				</div>
			</div>
			<div className="site-expanded-content__card-footer">
				<Button
					href={ `/activity-log/${ siteUrl }` }
					className="site-expanded-content__card-button"
					compact
				>
					{ translate( 'Activity log' ) }
				</Button>
			</div>
		</div>
	);
};

export default function BackupStorage( { site }: Props ) {
	const translate = useTranslate();

	const hasBackupError = [ 'rewind_backup_error', 'backup_only_error' ].includes(
		site.latest_backup_status
	);

	const components = {
		strong: <strong></strong>,
	};

	const isBackupEnabled = hasBackupError ? false : site.has_backup;

	return (
		<ExpandedCard
			header={ translate( 'Latest backup' ) }
			isEnabled={ isBackupEnabled }
			emptyContent={
				hasBackupError
					? translate( 'Fix {{strong}}Backup{{/strong}} connection to see your backup storage', {
							components,
					  } )
					: translate( 'Add {{strong}}Backup{{/strong}} to see your backup', {
							components,
					  } )
			}
		>
			{ isBackupEnabled && <BackupStorageContent siteId={ site.blog_id } siteUrl={ site.url } /> }
		</ExpandedCard>
	);
}
