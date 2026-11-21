import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import type { Activity } from '../../../components/logs-activity/types';
import type { Site } from '@automattic/api-core';

export function ManageBackupLink( { activity, site }: { activity: Activity; site: Site } ) {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();

	return (
		<Button
			variant="link"
			onClick={ () => {
				recordTracksEvent( 'calypso_dashboard_sites_logs_activity_restore_point_click', {
					activity_id: activity.activityId,
					rewind_id: activity.rewindId,
					site_id: site.ID,
				} );
				// A path rather than a route object: the agency dashboard registers
				// its own backups route at the same path.
				router.navigate( {
					to: `/sites/${ site.slug }/backups/${ activity.rewindId }`,
				} );
			} }
		>
			{ __( 'Manage backup' ) }
		</Button>
	);
}
