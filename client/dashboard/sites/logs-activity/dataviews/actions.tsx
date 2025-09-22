import { useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import type { SiteActivityLog } from '@automattic/api-core';
import type { Action } from '@wordpress/dataviews';

type UseActivityActionsOptions = {
	isLoading: boolean;
};

export function useActivityActions( {
	isLoading,
}: UseActivityActionsOptions ): Action< SiteActivityLog >[] {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

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

		return [ copySummaryAction ];
	}, [ isLoading, createSuccessNotice, createErrorNotice ] );
}
