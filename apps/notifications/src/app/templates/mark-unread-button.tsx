import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { bellUnread } from '@wordpress/icons';
import { useDispatch } from 'react-redux';
import { markUnread } from '../../panel/state/notes/thunks';
import { useAppContext } from '../context';
import type { Note } from '../types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

const MarkUnreadButton = ( { note, goBack }: { note: Note; goBack: () => void } ) => {
	const dispatch = useDispatch< ThunkDispatch< unknown, unknown, UnknownAction > >();
	const { client, isMarkAsUnreadEnabled } = useAppContext();

	if ( ! isMarkAsUnreadEnabled ) {
		return null;
	}

	const handleMarkUnread = () => {
		dispatch( markUnread( note, client ) );
		goBack();
	};

	return (
		<Button
			size="small"
			className="wpnc__mark-unread"
			icon={ bellUnread }
			label={ __( 'Mark as unread' ) }
			onClick={ handleMarkUnread }
		/>
	);
};

export default MarkUnreadButton;
