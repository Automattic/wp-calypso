import { useQueryClient } from '@tanstack/react-query';
import { SnackbarList } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon, published, error } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './style.scss';

const statusIcon: Record< string, React.JSX.Element > = {
	success: published,
	error,
};

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
					const error = mutation.meta?.snackbar?.error;
					const showServerError = typeof error === 'object' && error?.source === 'server';
					const errorMessage = showServerError ? event.action.error.message : error;

					if ( errorMessage ) {
						createErrorNotice( errorMessage, { type: 'snackbar' } );
					}
				}
			}
		} );
	}, [ queryClient, createSuccessNotice, createErrorNotice ] );

	const snackbarNotices = notices
		.filter( ( { type } ) => type === 'snackbar' )
		.map( ( notice ) => {
			const { status } = notice;
			const icon = statusIcon[ status ];
			const statusClassName = status ? `is-${ status }` : undefined;

			return {
				...notice,
				className: statusClassName,
				icon:
					'icon' in notice
						? notice.icon
						: icon && <Icon icon={ icon } style={ { fill: 'currentcolor' } } />,
			};
		} );

	// Portalled to <body> so it isn't inside the app root that `Modal` hides with
	// `aria-hidden`. Modal skips `aria-live` elements; `off` because `Snackbar`
	// announces itself via `speak()` and we don't want to hear it twice.
	return createPortal(
		<div aria-live="off">
			<SnackbarList
				notices={ snackbarNotices }
				className="dashboard-snackbars"
				onRemove={ removeNotice }
			/>
		</div>,
		document.body
	);
}
