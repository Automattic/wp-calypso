import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { getActions } from '../helpers/notes';
import getIsNoteApproved from '../state/selectors/get-is-note-approved';
import getIsNoteRead from '../state/selectors/get-is-note-read';
import NoteBody from './body';
import SummaryInList from './summary-in-list';
import SummaryInSingle from './summary-in-single';

const hasBadge = ( body ) =>
	body.some( ( { media } ) => media && media.some( ( { type } ) => 'badge' === type ) );

export const Note = React.forwardRef( ( props, ref ) => {
	const { currentNote, detailView, global, isApproved, isRead, note, selectedNote } = props;

	let hasCommentReply = false;
	let hasUnapprovedComment = false;

	if ( 'comment' === note.type ) {
		const noteBody = note.body;
		const noteActions = getActions( note );
		if ( noteBody.length > 1 && noteActions ) {
			/* Check if note has a reply to another comment */
			if ( noteBody[ 1 ] && noteBody[ 1 ].nest_level && noteBody[ 1 ].nest_level > 0 ) {
				hasCommentReply = true;
			}

			/* Check if note has unapproved comment */
			if ( 'approve-comment' in noteActions && ! isApproved ) {
				hasUnapprovedComment = true;
			}
		}
	}

	const classes = classNames( 'wpnc__note', `wpnc__${ note.type }`, {
		'comment-reply': hasCommentReply,
		read: isRead,
		unread: ! isRead,
		wpnc__badge: hasBadge( note.body ),
		'wpnc__comment-unapproved': hasUnapprovedComment,
		wpnc__current: detailView,
		'wpnc__selected-note': parseInt( selectedNote, 10 ) === parseInt( note.id, 10 ),
	} );

	return (
		<li
			id={ detailView ? 'note-details-' + note.id : 'note-' + note.id }
			className={ classes }
			tabIndex={ detailView ? -1 : 0 }
			role={ detailView ? 'article' : 'listitem' }
			aria-controls={ detailView ? null : 'note-details-' + note.id }
			aria-selected={ detailView ? null : currentNote === note.id }
		>
			{ ! detailView && (
				<SummaryInList
					currentNote={ currentNote }
					key={ 'note-summary-list' + note.id }
					note={ note }
					global={ global }
				/>
			) }
			{ detailView && <NoteBody key={ 'note-body-' + note.id } note={ note } global={ global } /> }
		</li>
	);
} );

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
	isRead: getIsNoteRead( state, note ),
} );

export default connect( mapStateToProps, null, null, { forwardRef: true } )( Note );
