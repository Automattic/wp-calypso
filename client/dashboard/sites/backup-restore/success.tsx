import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { Notice, NoticeActionButton } from '../../components/notice';
import type { Site } from '@automattic/api-core';

const SiteBackupRestoreSuccess = ( {
	restorePointDate,
	site,
}: {
	restorePointDate: string;
	site: Site;
} ) => {
	const { recordTracksEvent } = useAnalytics();

	const handleViewWebsiteClick = () => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_view_website' );
		window.open( site.URL, '_blank' );
	};

	return (
		<Notice
			variant="success"
			title={ __( 'Site successfully restored' ) }
			actions={
				<NoticeActionButton variant="solid" onClick={ handleViewWebsiteClick }>
					{ __( 'View website ↗' ) }
				</NoticeActionButton>
			}
		>
			{ sprintf(
				/* translators: %s is the date of the restore point */
				__( 'We restored the backup from %s.' ),
				restorePointDate
			) }
		</Notice>
	);
};

export default SiteBackupRestoreSuccess;
