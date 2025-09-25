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
				speak?: boolean; // announce to screen readers
				successPoliteness?: 'polite' | 'assertive'; // wait or interrupt to announce
				errorPoliteness?: 'polite' | 'assertive';
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
				const snackbarConfig = mutation.meta?.snackbar;
				if ( ! snackbarConfig ) {
					return;
				}

				const { success, error, successPoliteness, errorPoliteness, ...otherProps } =
					snackbarConfig;

				if ( event.action.type === 'success' && success ) {
					createSuccessNotice( success, {
						type: 'snackbar',
						...( successPoliteness && { politeness: successPoliteness } ),
						...otherProps,
					} );
				} else if ( event.action.type === 'error' && error ) {
					createErrorNotice( error, {
						type: 'snackbar',
						...( errorPoliteness && { politeness: errorPoliteness } ),
						...otherProps,
					} );
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
