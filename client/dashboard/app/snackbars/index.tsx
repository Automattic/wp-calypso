import { SnackbarList } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { Icon, published, error } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import React from 'react';
import './style.scss';

// Last three notices. Slices from the tail end of the list.
const MAX_VISIBLE_NOTICES = -3;

const statusIcon: Record< string, React.JSX.Element > = {
	success: published,
	error,
};

export default function Snackbars() {
	const notices = useSelect( ( select ) => select( noticesStore ).getNotices(), [] );
	const { removeNotice } = useDispatch( noticesStore );
	const snackbarNotices = notices
		.filter( ( { type } ) => type === 'snackbar' )
		.map( ( { status, ...notice } ) => ( {
			...notice,
			icon: statusIcon[ status ] && (
				<Icon icon={ statusIcon[ status ] } style={ { fill: 'currentcolor' } } />
			),
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
