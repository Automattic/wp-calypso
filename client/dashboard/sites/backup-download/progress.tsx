import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalSpacer as Spacer,
	ProgressBar,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect } from 'react';
import { siteBackupDownloadProgressQuery } from '../../app/queries/site-backup-download';
import Notice from '../../components/notice';
import backupDownloadIllustration from '../backups/backup-download-illustration.svg';
import type { Site } from '@automattic/api-core';

function SiteBackupDownloadProgress( {
	site,
	downloadId,
	onDownloadComplete,
	onDownloadError,
}: {
	site: Site;
	downloadId: number;
	onDownloadComplete: ( downloadUrl: string, fileSizeBytes?: string ) => void;
	onDownloadError: () => void;
} ) {
	const { data: downloadProgress } = useQuery( {
		...siteBackupDownloadProgressQuery( site.ID, downloadId ),
		enabled: !! downloadId,
		refetchInterval: ( query ) => {
			const { data } = query.state;

			// Poll every 1.5 seconds if download is in progress
			if ( ! data?.url ) {
				return 1500;
			}

			// Stop polling if finished or failed
			return false;
		},
	} );

	useEffect( () => {
		if ( downloadProgress?.url ) {
			onDownloadComplete( downloadProgress.url, downloadProgress.bytes_formatted );
		} else if ( downloadProgress?.error ) {
			onDownloadError();
		}
	}, [
		downloadProgress?.url,
		downloadProgress?.bytes_formatted,
		downloadProgress?.error,
		onDownloadComplete,
		onDownloadError,
	] );

	return (
		<>
			<VStack spacing={ 4 } alignment="center">
				<img
					src={ backupDownloadIllustration }
					alt=""
					width={ 408 }
					height={ 280 }
					style={ { opacity: 0.2 } }
				/>
				<Text size={ 20 }> { __( 'Initializing the download process' ) } </Text>
				<Text size={ 13 } variant="muted">
					{ sprintf(
						/* translators: %d is the download completion percentage. */
						__( '%d%% completed' ),
						downloadProgress?.progress ?? 0
					) }
				</Text>
				<ProgressBar
					className="dashboard-backups__progress-bar"
					value={ downloadProgress?.progress ?? 0 }
				/>
			</VStack>
			<Spacer marginTop={ 12 }>
				<Notice variant="info" title={ __( 'Check your email' ) }>
					{ __( 'For your convenience, we’ll email you when your file is ready.' ) }
				</Notice>
			</Spacer>
		</>
	);
}

export default SiteBackupDownloadProgress;
