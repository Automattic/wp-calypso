import { useRouter } from '@tanstack/react-router';
import { Icon } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { backup } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { siteBackupDetailRoute } from '../../../app/router/sites';
import type { SiteActivityLog, Site } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

type UseActivityActionsOptions = {
	isLoading: boolean;
	site: Site;
};

export function useActivityActions( {
	isLoading,
	site,
}: UseActivityActionsOptions ): Action< SiteActivityLog >[] {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const router = useRouter();

	return useMemo( () => {
		const copySummaryAction: Action< SiteActivityLog > = {
			id: 'copy-summary',
			label: __( 'Copy activity summary' ),
			disabled: isLoading,
			supportsBulk: false,
			callback: async ( items ) => {
				const [ item ] = items;
				const summary = item?.summary ?? '';
				try {
					await navigator.clipboard.writeText( summary );
					createSuccessNotice( __( 'Copied activity summary.' ), { type: 'snackbar' } );
				} catch ( e ) {
					createErrorNotice( __( 'Activity summary could not be copied.' ), { type: 'snackbar' } );
				}
			},
		};

		const backupAction: Action< SiteActivityLog > = {
			id: 'backup',
			label: __( 'View backup' ),
			icon: <Icon icon={ backup } />,
			disabled: isLoading,
			isPrimary: true,
			isEligible: ( item ) => item.is_rewindable,
			callback: async ( items ) => {
				const [ item ] = items;
				router.navigate( {
					to: siteBackupDetailRoute.fullPath,
					params: { siteSlug: site.slug, rewindId: item.rewind_id },
				} );
			},
		};

		return [ backupAction, copySummaryAction ];
	}, [ isLoading, createSuccessNotice, createErrorNotice, site, router ] );
}
