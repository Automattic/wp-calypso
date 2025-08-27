import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
	ProgressBar,
	CardBody,
	Card,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { siteBackupsQuery } from '../../app/queries/site-backups';
import { useFormattedTime } from '../../components/formatted-time';
import Notice from '../../components/notice';
import backupProgressIllustration from './backups-progress-illustration.svg';
import type { Site } from '../../data/types';

function SiteBackupProgress( { site }: { site: Site } ) {
	const { data: backups = [] } = useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: 2000,
	} );

	const currentBackup = backups[ 0 ];

	const backupDate = useFormattedTime( currentBackup.started, {
		timeStyle: 'short',
	} );

	const isRunning = currentBackup?.status === 'started';
	const isQueued = currentBackup?.status === 'queued';
	const progress = currentBackup ? parseInt( currentBackup.percent, 10 ) : 0;

	const getMessage = () => {
		if ( isQueued ) {
			return __( 'Backup queued and will start shortly' );
		}
		if ( isRunning ) {
			return __( 'Backup in progress' );
		}
		return __( 'Initializing the backup process' );
	};

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 2 } alignment="center">
						<img src={ backupProgressIllustration } alt="" width={ 408 } height={ 280 } />
						<Text size={ 20 }>{ getMessage() }</Text>
						<Text size={ 13 } variant="muted">
							{ sprintf(
								/* translators: %s is the date the backup was initiated. */
								__( 'We’re making a backup of your site from %s' ),
								backupDate
							) }
						</Text>
						<Text size={ 13 } variant="muted">
							{ sprintf(
								/* translators: %d is the backup completion percentage. */
								__( '%d%% completed' ),
								progress
							) }
						</Text>
						<ProgressBar className="dashboard-backups__progress-bar" value={ progress } />
					</VStack>
					<Spacer marginTop={ 12 }>
						<Notice variant="info" title={ __( 'Did you know?' ) }>
							{ __(
								'We store your site backups securely in the cloud, with multiple copies saved across our global server network, so you will never lose your content.'
							) }
						</Notice>
					</Spacer>
				</CardBody>
			</Card>
		</>
	);
}

export default SiteBackupProgress;
