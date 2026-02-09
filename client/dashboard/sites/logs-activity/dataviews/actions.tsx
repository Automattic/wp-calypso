import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { useMemo } from 'react';
import { Activity } from '../../..//components/logs-activity/types';
import { useAnalytics } from '../../../app/analytics';
import { siteBackupDetailRoute } from '../../../app/router/sites';
import type { Site } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

type UseActivityActionsOptions = {
	isLoading: boolean;
	site: Site;
};

export function useActivityActions( {
	isLoading,
	site,
}: UseActivityActionsOptions ): Action< Activity >[] {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();

	return useMemo( () => {
		const backupAction: Action< Activity > = {
			id: 'backup',
			isPrimary: true,
			label: __( 'Manage backup' ),
			icon: <Icon icon={ backup } />,
			disabled: isLoading,
			isEligible: ( item ) => item.activityIsRewindable,
			callback: async ( items ) => {
				const [ item ] = items;
				if ( item ) {
					recordTracksEvent( 'calypso_dashboard_sites_logs_activity_restore_point_click', {
						activity_id: item.activityId,
						rewind_id: item.rewindId,
						site_id: site.ID,
					} );
				}
				router.navigate( {
					to: siteBackupDetailRoute.fullPath,
					params: { siteSlug: site.slug, rewindId: item.rewindId },
				} );
			},
		};

		return [ backupAction ];
	}, [ isLoading, site, router, recordTracksEvent ] );
}
