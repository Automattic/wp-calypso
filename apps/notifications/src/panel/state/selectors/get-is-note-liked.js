/**
 * Internal dependencies
 */
import getNotes from './get-notes';
import { getActions } from '../../helpers/notes';

export const getIsNoteLiked = ( notesState, note ) => {
	const noteLikes = notesState.noteLikes;

	if ( noteLikes.hasOwnProperty( note.id ) ) {
		return noteLikes[ note.id ];
	}

	const actionMeta = getActions( note );
	const likeProperty = note.meta.ids.comment ? 'like-comment' : 'like-post';

	return actionMeta[ likeProperty ];
};

export default ( state, note ) => getIsNoteLiked( getNotes( state ), note );
