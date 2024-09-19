import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { connect } from 'react-redux';
import { getActions } from '../helpers/notes';
import actions from '../state/actions';
import getIsNoteApproved from '../state/selectors/get-is-note-approved';
import getIsNoteRead from '../state/selectors/get-is-note-read';
import NoteBody from './body';
import SummaryInList from './summary-in-list';
import SummaryInSingle from './summary-in-single';

const hasBadge = ( body ) =>
	body.some( ( { media } ) => media && media.some( ( { type } ) => 'badge' === type ) );

export const Note = React.forwardRef( ( props, ref ) => {
	const {
		currentNote,
		detailView,
		global,
		isApproved,
		isRead,
		note,
		selectedNote,
		unselectNote,
		isShowing,
		handleFocus,
	} = props;
	const translate = useTranslate();

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

	const isSelected = parseInt( selectedNote, 10 ) === parseInt( note.id, 10 );

	const classes = clsx( 'wpnc__note', `wpnc__${ note.type }`, {
		'comment-reply': hasCommentReply,
		read: isRead,
		unread: ! isRead,
		wpnc__badge: hasBadge( note.body ),
		'wpnc__comment-unapproved': hasUnapprovedComment,
		wpnc__current: detailView,
		'wpnc__selected-note': isSelected,
	} );

	const noteContainerRef = React.useRef();
	const noteBodyRef = React.useRef( null );

	const setContainerRef = React.useCallback( ( currentRef ) => {
		noteContainerRef.current = currentRef;
		if ( typeof ref === 'function' ) {
			ref( currentRef );
		} else {
			ref = currentRef;
		}
	}, [] );

	React.useEffect( () => {
		let timerId;
		if ( isShowing && isSelected && ! currentNote && noteContainerRef.current ) {
			noteContainerRef.current.focus();
			// It might not be focused immediately when the panel is opening because of the pointer-events is none.
			if ( document.activeElement !== noteContainerRef.current ) {
				timerId = window.setTimeout( () => noteContainerRef.current.focus(), 300 );
			}
		}

		return () => {
			if ( timerId ) {
				window.clearTimeout( timerId );
			}
		};
	}, [ isShowing, isSelected, currentNote ] );

	React.useEffect( () => {
		if ( detailView && noteBodyRef.current ) {
			noteBodyRef.current.focus();
		}
	}, [ detailView, noteBodyRef ] );

	return (
		<li
			id={ detailView ? 'note-details-' + note.id : 'note-' + note.id }
			className={ classes }
			ref={ setContainerRef }
			tabIndex={ detailView ? -1 : 0 }
			role={ detailView ? 'article' : 'listitem' }
			aria-controls={ detailView ? null : 'note-details-' + note.id }
			aria-selected={ detailView ? null : isSelected }
			onFocus={ () => handleFocus( note.id ) }
		>
			{ ! detailView && (
				<SummaryInList
					currentNote={ currentNote }
					key={ 'note-summary-list' + note.id }
					note={ note }
					global={ global }
				/>
			) }
			{ detailView && (
				<div
					className="wpnc__note-body"
					role="region"
					aria-label={ translate( 'Notification details' ) }
					tabIndex={ -1 }
					ref={ noteBodyRef }
				>
					{ note.header && note.header.length > 0 && (
						<SummaryInSingle key={ 'note-summary-single-' + note.id } note={ note } />
					) }

					<NoteBody key={ 'note-body-' + note.id } note={ note } global={ global } />

					<button
						className="screen-reader-text"
						onClick={ () => {
							const noteItemElement = document.getElementById( 'note-' + note.id );

							if ( noteItemElement ) {
								noteItemElement.focus();
							}

							unselectNote();
						} }
					>
						{ translate( 'Back to notifications' ) }
					</button>
				</div>
			) }
		</li>
	);
} );

const mapStateToProps = ( state, { note } ) => ( {
	isApproved: getIsNoteApproved( state, note ),
	isRead: getIsNoteRead( state, note ),
} );

const mapDispatchToProps = {
	unselectNote: actions.ui.unselectNote,
};

export default connect( mapStateToProps, mapDispatchToProps, null, { forwardRef: true } )( Note );
