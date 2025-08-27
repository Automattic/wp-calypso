import {
	__experimentalDivider as Divider,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	CardHeader,
	CardBody,
	CardFooter,
	Navigator,
	useNavigator,
} from '@wordpress/components';
import { isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getActions } from '../../panel/helpers/notes';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import getIsNoteRead from '../../panel/state/selectors/get-is-note-read';
import { NoteBody, ActionBlock } from '../templates/body';
import NoteSummary from '../templates/note-summary';
import '../../panel/boot/stylesheets/style.scss';
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

const Note = () => {
	const { params } = useNavigator();
	const { noteId } = params;
	const note = useSelector( ( state ) =>
		( getAllNotes( state ) as NoteObject[] ).find( ( note ) => String( note.id ) === noteId )
	);

	const isApproved = useSelector( ( state ) => note && getIsNoteApproved( state, note ) );
	const isRead = useSelector( ( state ) => note && getIsNoteRead( state, note ) );

	// Ensure the component is focused on mount
	// to avoid parent's <Popover>'s focus trap from moving.
	const focusRef = useRef< HTMLDivElement >( null );
	useEffect( () => {
		focusRef.current?.focus();
	}, [] );

	if ( ! note ) {
		return null;
	}

	return (
		<div ref={ focusRef } tabIndex={ -1 }>
			<CardHeader size="small">
				<HStack>
					<Navigator.BackButton
						icon={ isRTL() ? chevronRight : chevronLeft }
						style={ { padding: 0 } }
					>
						<Heading level={ 3 } size={ 15 } weight={ 500 }>
							{ note.title }
						</Heading>
					</Navigator.BackButton>
				</HStack>
			</CardHeader>
			<CardBody size="small" style={ { maxHeight: 'unset' } }>
				<VStack justify="flex-start" spacing={ 4 }>
					<NoteSummary note={ note } />
					<Divider style={ { color: '#ddd' } } />
					{ /* Add `wpnc__main` here to keep the same classes structure as v1. We'll iterate styles later. */ }
					<div className="wpnc__main">
						<div className={ getClasses( { note, isApproved, isRead } ) }>
							<NoteBody note={ note } />
						</div>
					</div>
				</VStack>
			</CardBody>
			<CardFooter size="small">
				<ActionBlock note={ note } />
			</CardFooter>
		</div>
	);
};

export default Note;
