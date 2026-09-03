import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import OverviewCard from '../../../components/overview-card';
import { BackupCardContent } from '../../../sites/overview-backup-card';
import type { AgencySite } from '@automattic/api-core';

export default function BackupCard( { site }: { site: AgencySite } ) {
	if ( ! site.has_backup ) {
		return (
			<OverviewCard
				icon={ backup }
				title={ __( 'Last backup' ) }
				heading={ __( 'Not active' ) }
				description={ __( 'Backups aren’t enabled for this site.' ) }
			/>
		);
	}

	return <BackupCardContent siteId={ site.blog_id } backupUrl={ `/sites/${ site.url }/backups` } />;
}
