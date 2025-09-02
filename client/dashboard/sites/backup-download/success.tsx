import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, download, check } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { siteBackupsRoute } from '../../app/router/sites';
import Notice from '../../components/notice';
import type { Site } from '@automattic/api-core';

function SiteBackupDownloadSuccess( {
	site,
	downloadPointDate,
	downloadUrl,
	fileSizeBytes,
}: {
	site: Site;
	downloadPointDate: string;
	downloadUrl: string;
	fileSizeBytes?: string;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const router = useRouter();

	const handleAllBackupsClick = () => {
		recordTracksEvent( 'calypso_dashboard_backups_download_all_backups' );
		router.navigate( { to: siteBackupsRoute.fullPath, params: { siteSlug: site.slug } } );
	};

	const handleDownloadClick = () => {
		recordTracksEvent( 'calypso_dashboard_backups_download_download_file' );
		window.open( downloadUrl, '_blank' );
	};

	return (
		<>
			<HStack spacing={ 4 }>
				<HStack justify="flex-start">
					<Icon icon={ check } />
					<VStack spacing={ 1 }>
						<Text size={ 15 }>{ __( 'Backup download file is ready' ) }</Text>
						<Text size={ 13 } variant="muted">
							{ downloadPointDate }
						</Text>
					</VStack>
				</HStack>
				<HStack justify="flex-end">
					<Button
						variant="tertiary"
						text={ __( 'All backups' ) }
						onClick={ handleAllBackupsClick }
					/>
					<Button
						variant="primary"
						icon={ download }
						text={ __( 'Download file' ) + ( fileSizeBytes ? ` (${ fileSizeBytes })` : '' ) }
						onClick={ handleDownloadClick }
					/>
				</HStack>
			</HStack>

			<Notice variant="info" title={ __( 'Check your email' ) }>
				{ __( 'For your convenience, we’ve emailed you a link to your downloadable backup file.' ) }
			</Notice>
		</>
	);
}

export default SiteBackupDownloadSuccess;
