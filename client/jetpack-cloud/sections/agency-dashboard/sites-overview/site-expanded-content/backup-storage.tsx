import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { getMemoryHumanReadable } from '../utils';
import ExpandedCard from './expanded-card';
import type { Site } from '../types';

interface Props {
	site: Site;
}

export default function BackupStorage( { site }: Props ) {
	const translate = useTranslate();

	const data = {
		backupUsed: 9600000000,
		backupAvailable: 26000,
		backupStorageAlmostFull: false,
		hasBackup: site.has_backup,
		hasBackupError: [ 'rewind_backup_error', 'backup_only_error' ].includes(
			site.latest_backup_status
		),
	};

	const components = {
		strong: <strong></strong>,
	};

	return (
		<ExpandedCard
			header={ translate( 'Backup Storage' ) }
			isEnabled={ data.hasBackupError ? false : data.hasBackup }
			emptyContent={
				data.hasBackupError
					? translate( 'Fix {{strong}}Backup{{/strong}} connection to see your backup storage', {
							components,
					  } )
					: translate( 'Add {{strong}}Backup{{/strong}} to see your backup storage', {
							components,
					  } )
			}
		>
			<div className="site-expanded-content__card-content-container">
				<div className="site-expanded-content__card-content">
					<div className="site-expanded-content__card-content-column">
						<div className="site-expanded-content__card-content-count">
							<span className="site-expanded-content__card-content-count-used">
								{ getMemoryHumanReadable( data.backupUsed ) }
							</span>
							<span
								className={ classNames( data.backupStorageAlmostFull ? 'is-full' : 'is-free' ) }
							>
								{ translate( '%(backupAvailable)s Available', {
									args: {
										backupAvailable: getMemoryHumanReadable( data.backupAvailable ),
									},
								} ) }
							</span>
						</div>
						<div className="site-expanded-content__card-content-count-title">
							{ translate( 'Used storage' ) }
						</div>
					</div>
				</div>
				<div className="site-expanded-content__card-footer">
					<Button className="site-expanded-content__card-button" compact>
						{ translate( 'Activity log' ) }
					</Button>
				</div>
			</div>
		</ExpandedCard>
	);
}
