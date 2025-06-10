import { SnackbarList } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import './style.scss';

// Last three notices. Slices from the tail end of the list.
const MAX_VISIBLE_NOTICES = -3;

export default function Snackbars() {
	const notices = useSelect( ( select ) => select( noticesStore ).getNotices(), [] );
	const { removeNotice } = useDispatch( noticesStore );
	const snackbarNotices = notices
		.filter( ( { type } ) => type === 'snackbar' )
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
