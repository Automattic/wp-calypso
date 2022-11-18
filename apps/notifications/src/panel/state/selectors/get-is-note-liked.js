import { getActions } from '../../helpers/notes';
import getNotes from './get-notes';

export const getIsNoteLiked = ( notesState, note ) => {
	const noteLikes = notesState.noteLikes;

	if ( noteLikes.hasOwnProperty( note.id ) ) {
		return noteLikes[ note.id ];
	}

	const actionMeta = getActions( note );
	const likeProperty = note.meta.ids.comment ? 'like-comment' : 'like-post';

	return actionMeta[ likeProperty ] ?? false;
};

export default ( state, note ) => getIsNoteLiked( getNotes( state ), note );
