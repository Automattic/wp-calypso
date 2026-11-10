import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { Notice, NoticeActionLinkButton } from '../../components/notice';
import type { Site } from '@automattic/api-core';

const SiteBackupRestoreSuccess = ( {
	restorePointDate,
	site,
}: {
	restorePointDate: string;
	site: Site;
} ) => {
	const { recordTracksEvent } = useAnalytics();

	return (
		<Notice
			variant="success"
			title={ __( 'Site successfully restored' ) }
			actions={
				<NoticeActionLinkButton
					variant="solid"
					href={ site.URL }
					openInNewTab
					rel="noopener noreferrer"
					onClick={ () => recordTracksEvent( 'calypso_dashboard_backups_restore_view_website' ) }
				>
					{ __( 'View website' ) }
				</NoticeActionLinkButton>
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
