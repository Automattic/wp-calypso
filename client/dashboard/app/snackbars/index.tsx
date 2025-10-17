import { useQueryClient } from '@tanstack/react-query';
import { SnackbarList } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon, published, error } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import './style.scss';

// Last three notices. Slices from the tail end of the list.
const MAX_VISIBLE_NOTICES = -3;

const statusIcon: Record< string, React.JSX.Element > = {
	success: published,
	error,
};

declare module '@tanstack/react-query' {
	interface Register {
		mutationMeta: {
			snackbar?: {
				success?: string;
				error?: string;
			};
		};
	}
}

export default function Snackbars() {
	const notices = useSelect( ( select ) => select( noticesStore ).getNotices(), [] );
	const { removeNotice, createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const queryClient = useQueryClient();

	// Displays snackbars which have been requested through the `meta` option of
	// the `useMutation` hook.
	useEffect( () => {
		return queryClient.getMutationCache().subscribe( ( event ) => {
			const { type, mutation } = event;
			if ( type === 'updated' ) {
				if ( event.action.type === 'success' ) {
					const message = mutation.meta?.snackbar?.success;
					if ( message ) {
						createSuccessNotice( message, { type: 'snackbar' } );
					}
				} else if ( event.action.type === 'error' ) {
					const message = mutation.meta?.snackbar?.error;
					if ( message ) {
						createErrorNotice( message, { type: 'snackbar' } );
					}
				}
			}
		} );
	}, [ queryClient, createSuccessNotice, createErrorNotice ] );

	const snackbarNotices = notices
		.filter( ( { type } ) => type === 'snackbar' )
		.map( ( { status, ...notice } ) => ( {
			icon: statusIcon[ status ] && (
				<Icon icon={ statusIcon[ status ] } style={ { fill: 'currentcolor' } } />
			),
			...notice,
		} ) )
		.slice( MAX_VISIBLE_NOTICES );

	return (
		<SnackbarList
			// @ts-expect-error Bypass typecheck as WPNoticeAction is structurally incompatible with NoticeAction
			notices={ snackbarNotices }
			className="dashboard-snackbars"
			onRemove={ removeNotice }
		/>
	);
}
