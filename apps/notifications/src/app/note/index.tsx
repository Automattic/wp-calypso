import {
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	Button,
	CardHeader,
	CardBody,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getActions } from '../../panel/helpers/notes';
import actions from '../../panel/state/actions';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteRead from '../../panel/state/selectors/get-is-note-read';
import ActionDropdown from '../templates/action-dropdown';
import { NoteBody, ActionBlock } from '../templates/body';
import CloseButton from '../templates/close-button';
import NoteSummary from '../templates/note-summary';
import './style.scss';
import type { Note as NoteObject, Block } from '../types';

const hasBadge = ( body: NoteObject[ 'body' ] ) =>
	body.some(
		( { media }: Block ) =>
			media && media.some( ( { type }: { type: string } ) => 'badge' === type )
	);

const getClasses = ( {
	note,
	isApproved,
	isRead,
}: {
	note: NoteObject;
	isApproved: boolean;
	isRead: boolean;
} ) => {
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

	return clsx( 'wpnc__note', `wpnc__${ note.type }`, {
		'comment-reply': hasCommentReply,
		read: isRead,
		unread: ! isRead,
		wpnc__badge: hasBadge( note.body ),
		'wpnc__comment-unapproved': hasUnapprovedComment,
	} );
};

type NoteProps = {
	isDismissible?: boolean;
	// The note id to render — equals the user's selection while open and
	// the exiting id during the slide-out animation.
	noteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
};

const Note = ( { isDismissible, noteId, setSelectedNoteId }: NoteProps ) => {
	const dispatch = useDispatch();
	const isLargeScreen = useViewportMatch( 'large' );
	const goBack = () => setSelectedNoteId( undefined );

	const notes = useSelector( ( state ) => ( getAllNotes( state ) || [] ) as NoteObject[] );
	const note = notes.find( ( note ) => String( note.id ) === noteId );

	const isApproved = useSelector( ( state ) => note && getIsNoteApproved( state, note ) );
	const isRead = useSelector( ( state ) => note && getIsNoteRead( state, note ) );

	useEffect( () => {
		if ( note?.id ) {
			dispatch( actions.ui.selectNote( note.id ) );
		}
	}, [ note?.id, dispatch ] );

	if ( ! note ) {
		return null;
	}

	return (
		<>
			<CardHeader
				size="small"
				style={ {
					position: 'sticky',
					top: 0,
					background: 'var( --color-surface, #fff )',
					zIndex: 1,
				} }
			>
				<HStack>
					<HStack justify="flex-start">
						{ ! isLargeScreen && (
							<Button
								size="small"
								icon={ isRTL() ? chevronRight : chevronLeft }
								label={ __( 'Back' ) }
								onClick={ goBack }
							/>
						) }
						<Heading level={ 3 } size={ 15 } weight={ 500 }>
							{ note.title }
						</Heading>
					</HStack>
					<HStack justify="flex-end" style={ { width: 'auto' } }>
						<ActionDropdown note={ note } goBack={ goBack } />
						{ isDismissible && <CloseButton /> }
					</HStack>
				</HStack>
			</CardHeader>
			<CardBody size="small" style={ { maxHeight: 'unset' } }>
				<VStack justify="flex-start" spacing={ 4 }>
					<NoteSummary note={ note } />
					<Divider style={ { color: 'var( --color-border-subtle, #f0f0f0 )' } } />
					<div className={ getClasses( { note, isApproved, isRead } ) }>
						<NoteBody note={ note } />
					</div>
				</VStack>
			</CardBody>
			<ActionBlock note={ note } goBack={ goBack } />
		</>
	);
};

export default Note;
