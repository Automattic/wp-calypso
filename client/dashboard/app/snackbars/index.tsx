import {
	registerMutationSuccessCallback,
	registerMutationErrorCallback,
} from '@automattic/api-queries';
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

	// Displays snackbars which have been requested through the `meta` option of
	// the `useMutation` hook.
	useEffect( () => {
		const cleanupSuccess = registerMutationSuccessCallback(
			( data, variables, context, mutation ) => {
				const message = mutation.meta?.snackbar?.success;
				if ( message ) {
					createSuccessNotice( message, { type: 'snackbar' } );
				}
			}
		);
		const cleanupError = registerMutationErrorCallback( ( error, variables, context, mutation ) => {
			const message = mutation.meta?.snackbar?.error;
			if ( message ) {
				createErrorNotice( message, { type: 'snackbar' } );
			}
		} );
		return () => {
			cleanupSuccess();
			cleanupError();
		};
	}, [ createSuccessNotice, createErrorNotice ] );

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
