import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
	ProgressBar,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from 'react';
import { siteBackupRestoreProgressQuery } from '../../app/queries/site-backup-restore';
import Notice from '../../components/notice';
import noSitesIllustration from '../no-sites-illustration.svg';
import type { Site } from '../../data/types';

function SiteBackupRestoreProgress( {
	site,
	restoreId,
	onRestoreComplete,
	onRestoreError,
}: {
	site: Site;
	restoreId: number;
	onRestoreComplete: () => void;
	onRestoreError: () => void;
} ) {
	const { data: restoreProgress } = useQuery( {
		...siteBackupRestoreProgressQuery( site.ID, restoreId ),
		enabled: !! restoreId,
	} );

	useEffect( () => {
		if ( restoreProgress?.status === 'finished' ) {
			onRestoreComplete();
		} else if ( restoreProgress?.status === 'fail' ) {
			onRestoreError();
		}
	}, [ restoreProgress?.status, onRestoreComplete, onRestoreError ] );

	const isRunning = restoreProgress?.status === 'running';

	return (
		<>
			<VStack spacing={ 4 } alignment="center">
				<img
					src={ noSitesIllustration }
					alt=""
					width={ 408 }
					height={ 280 }
					style={ { opacity: 0.2 } }
				/>
				<Text size={ 20 }>
					{ isRunning ? restoreProgress?.message : __( 'Initializing the restore process' ) }
				</Text>
				<Text size={ 13 } variant="muted">
					{ sprintf(
						/* translators: %d is the restore completion percentage. */
						__( '%d%% completed' ),
						restoreProgress?.percent ?? 0
					) }
				</Text>
				<ProgressBar
					className="dashboard-backups__progress-bar"
					value={ restoreProgress?.percent ?? 0 }
				/>
			</VStack>
			<Spacer marginTop={ 12 }>
				<Notice variant="info" title={ __( 'Check your email' ) }>
					{ __(
						'Don’t want to wait? For your convenience, we’ll email you when your site has been fully restored.'
					) }
				</Notice>
			</Spacer>
		</>
	);
}

export default SiteBackupRestoreProgress;
