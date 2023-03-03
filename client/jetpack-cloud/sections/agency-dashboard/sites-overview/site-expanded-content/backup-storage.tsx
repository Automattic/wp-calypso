import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import ExpandedCard from './expanded-card';
import type { Site } from '../types';

interface Props {
	site: Site;
}

export default function BackupStorage( { site }: Props ) {
	const translate = useTranslate();

	const data = {
		hasBackup: site.has_backup,
		hasBackupError: [ 'rewind_backup_error', 'backup_only_error' ].includes(
			site.latest_backup_status
		),
		backupInfo: {
			backupDate: '2023-03-03T11:09:44.777+00:00',
			backedUpItems: {
				posts: 2,
				pages: 1,
			},
		},
	};

	const components = {
		strong: <strong></strong>,
	};

	const getDisplayDate = useGetDisplayDate();
	const displayDate = getDisplayDate( data.backupInfo.backupDate, false );

	return (
		<ExpandedCard
			header={ translate( 'Latest backup' ) }
			isEnabled={ data.hasBackupError ? false : data.hasBackup }
			emptyContent={
				data.hasBackupError
					? translate( 'Fix {{strong}}Backup{{/strong}} connection to see your backup storage', {
							components,
					  } )
					: translate( 'Add {{strong}}Backup{{/strong}} to see your backup', {
							components,
					  } )
			}
		>
			<div className="site-expanded-content__card-content-container">
				<div className="site-expanded-content__card-content">
					<div className="site-expanded-content__card-content-column">
						<div className="site-expanded-content__card-content-count">{ displayDate }</div>
						<div className="site-expanded-content__card-content-count-title">2 posts, 1 page</div>
					</div>
				</div>
				<div className="site-expanded-content__card-footer">
					<Button
						href={ `/activity-log/${ site.url }` }
						className="site-expanded-content__card-button"
						compact
					>
						{ translate( 'Activity log' ) }
					</Button>
				</div>
			</div>
		</ExpandedCard>
	);
}
