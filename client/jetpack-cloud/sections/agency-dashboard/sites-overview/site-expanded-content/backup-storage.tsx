import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { isSuccessfulRealtimeBackup } from 'calypso/lib/jetpack/backup-utils';
import useDateWithOffset from 'calypso/lib/jetpack/hooks/use-date-with-offset';
import ExpandedCard from './expanded-card';
import type { Site } from '../types';

interface Props {
	site: Site;
}

const BACKUP_ERROR_STATUSES = [ 'rewind_backup_error', 'backup_only_error' ];

const BackupStorageContent = ( { siteId, siteUrl }: { siteId: number; siteUrl: string } ) => {
	const translate = useTranslate();

	const moment = useLocalizedMoment();
	const endDate = useDateWithOffset( moment().endOf( 'day' ) );
	const startDate = useDateWithOffset( moment().subtract( 1, 'day' ).startOf( 'day' ) );

	const { isLoading, data } = useRewindableActivityLogQuery(
		siteId,
		{
			after: startDate?.toISOString() ?? undefined,
			before: endDate?.toISOString() ?? undefined,
		},
		{
			select: ( backups: any[] ) =>
				backups.filter( ( backup ) => isSuccessfulRealtimeBackup( backup ) ),
		}
	);

	const backup = data?.[ 0 ] ?? null;

	const lastBackupDate = useDateWithOffset( backup?.activityTs );
	const getDisplayDate = useGetDisplayDate();
	const displayDate = getDisplayDate( lastBackupDate, false );

	// Show plugin name only if it is a activity from a plugin
	const pluginName =
		backup?.activityName.startsWith( 'plugin__' ) && backup.activityDescription[ 0 ]?.children[ 0 ];

	const backupTitle =
		backup?.activityDescription[ 0 ]?.children[ 0 ]?.text ?? backup?.activityTitle;

	const showLoader = isLoading || ! backup;

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
								{ backupTitle }
								{ pluginName ? ` - ${ pluginName }` : '' }
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

	const hasBackupError = BACKUP_ERROR_STATUSES.includes( site.latest_backup_status );

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
