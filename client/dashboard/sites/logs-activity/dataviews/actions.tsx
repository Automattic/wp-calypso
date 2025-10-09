import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { Activity } from '../../..//components/logs-activity/types';
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

	return useMemo( () => {
		const backupAction: Action< Activity > = {
			id: 'backup',
			label: __( 'See restore point' ),
			icon: <Icon icon={ backup } />,
			disabled: isLoading,
			isPrimary: true,
			isEligible: ( item ) => item.activityIsRewindable,
			callback: async ( items ) => {
				const [ item ] = items;
				router.navigate( {
					to: siteBackupDetailRoute.fullPath,
					params: { siteSlug: site.slug, rewindId: item.rewindId },
				} );
			},
		};

		return [ backupAction ];
	}, [ isLoading, site, router ] );
}
