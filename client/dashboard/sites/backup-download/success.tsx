import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { download } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { Notice } from '../../components/notice';
import { Text } from '../../components/text';

function SiteBackupDownloadSuccess( {
	downloadPointDate,
	downloadUrl,
	fileSizeBytes,
}: {
	downloadPointDate: string;
	downloadUrl: string;
	fileSizeBytes?: string;
} ) {
	const { recordTracksEvent } = useAnalytics();

	const handleDownloadClick = () => {
		recordTracksEvent( 'calypso_dashboard_backups_download_download_file' );
		window.open( downloadUrl, '_blank' );
	};

	return (
		<Notice
			variant="success"
			title={ __( 'Backup download file is ready' ) }
			actions={
				<Button
					variant="primary"
					icon={ download }
					text={ __( 'Download file' ) + ( fileSizeBytes ? ` (${ fileSizeBytes })` : '' ) }
					onClick={ handleDownloadClick }
				/>
			}
		>
			<VStack spacing={ 1 }>
				<Text>
					{ sprintf(
						/* translators: %s is the date of the download point */
						__( 'We’ve prepared your backup from %s.' ),
						downloadPointDate
					) }
				</Text>
				<Text>
					{ __(
						'For your convenience, we’ve emailed you a link to your downloadable backup file.'
					) }
				</Text>
			</VStack>
		</Notice>
	);
}

export default SiteBackupDownloadSuccess;
