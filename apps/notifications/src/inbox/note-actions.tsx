import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	TextareaControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { starEmpty, starFilled } from '@wordpress/icons';
import { useRef, useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppContext } from '../app/context';
import ActionsMenu from '../app/templates/actions-menu';
import { getActions, getReferenceId } from '../panel/helpers/notes';
import { recordTracksEvent } from '../panel/helpers/stats';
import { wpcom } from '../panel/rest-client/wpcom';
import actions from '../panel/state/actions';
import { setLikeStatus } from '../panel/state/notes/thunks';
import getIsNoteApproved from '../panel/state/selectors/get-is-note-approved';
import getIsNoteLiked from '../panel/state/selectors/get-is-note-liked';
import type { Note } from '../app/types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

import './style.scss';

export type InboxUser = {
	name: string;
	avatarUrl?: string;
};

const MENU_ACTIONS = [ 'approve-comment', 'edit-comment', 'spam-comment', 'trash-comment' ];

/**
 * Posts a reply to the note's comment, or a new comment on its post.
 */
function postReply( note: Note, text: string, onDone: ( error: Error | null ) => void ) {
	const { site, post, comment } = note.meta?.ids ?? {};

	if ( site && comment ) {
		wpcom().site( site ).comment( comment ).reply( text, onDone );
	} else if ( site && post ) {
		wpcom().site( site ).post( post ).comment().add( text, onDone );
	}
}

function ReplyForm( { note, currentUser }: { note: Note; currentUser: InboxUser } ) {
	const textareaRef = useRef< HTMLTextAreaElement | null >( null );
	const dispatch = useDispatch();
	const { client } = useAppContext();
	const [ replyText, setReplyText ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const handleSubmit = ( event: FormEvent ) => {
		event.preventDefault();
		if ( ! replyText.trim() || isSubmitting ) {
			return;
		}

		setIsSubmitting( true );
		recordTracksEvent( 'calypso_notification_note_reply', { note_type: note.type } );

		postReply( note, replyText, ( error ) => {
			setIsSubmitting( false );
			if ( error ) {
				return;
			}

			if ( note.meta?.ids?.comment ) {
				dispatch( actions.notes.approveNote( note.id, true ) );
				client?.getNote( note.id );
			}
			setReplyText( '' );
		} );
	};

	const handleCancel = () => {
		setReplyText( '' );
		textareaRef.current?.blur();
	};

	return (
		<form className="wpnc-inbox__reply" onSubmit={ handleSubmit }>
			<VStack spacing={ 3 }>
				<HStack spacing={ 3 } justify="flex-start">
					{ currentUser.avatarUrl && (
						<img className="wpnc-inbox__reply-avatar" src={ currentUser.avatarUrl } alt="" />
					) }
					<strong>{ currentUser.name }</strong>
				</HStack>
				<TextareaControl
					ref={ textareaRef }
					label={ __( 'Reply' ) }
					hideLabelFromVision
					rows={ 4 }
					value={ replyText }
					onChange={ setReplyText }
					__nextHasNoMarginBottom
				/>
				<HStack spacing={ 2 } justify="flex-end">
					<Button variant="tertiary" onClick={ handleCancel } __next40pxDefaultSize>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						type="submit"
						variant="primary"
						isBusy={ isSubmitting }
						disabled={ ! replyText.trim() || isSubmitting }
						accessibleWhenDisabled
						__next40pxDefaultSize
					>
						{ __( 'Reply' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}

/**
 * Renders the inbox's Like and Actions buttons for a note, with a reply form below them.
 */
export default function NoteActions( {
	note,
	goBack,
	currentUser,
}: {
	note: Note;
	goBack: () => void;
	currentUser: InboxUser;
} ) {
	const dispatch = useDispatch< ThunkDispatch< unknown, unknown, UnknownAction > >();
	const { client } = useAppContext();
	const isApproved = useSelector( ( state ) => getIsNoteApproved( state, note ) );
	const isLiked = useSelector( ( state ) => getIsNoteLiked( state, note ) );
	const noteActions = getActions( note );
	const hasAction = ( ...types: string[] ) => types.some( ( type ) => type in noteActions );

	const hasReply = hasAction( 'replyto-comment' );
	const hasLike = hasAction( 'like-post', 'like-comment' );
	const hasMenu = hasAction( ...MENU_ACTIONS );

	if ( ! hasReply && ! hasLike && ! hasMenu ) {
		return null;
	}

	const toggleLike = () =>
		dispatch(
			setLikeStatus(
				note.id,
				getReferenceId( note, 'site' ),
				getReferenceId( note, 'post' ),
				getReferenceId( note, 'comment' ),
				! isLiked,
				client
			)
		);

	return (
		<VStack spacing={ 6 }>
			<HStack spacing={ 2 }>
				<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
					{ hasLike && (
						<Button
							className="wpnc-inbox__action"
							variant="secondary"
							icon={ isLiked ? starFilled : starEmpty }
							onClick={ toggleLike }
							__next40pxDefaultSize
						>
							{ isLiked ? __( 'Liked' ) : __( 'Like' ) }
						</Button>
					) }
				</HStack>
				{ hasMenu && (
					<ActionsMenu
						hasAction={ hasAction }
						isApproved={ isApproved }
						note={ note }
						goBack={ goBack }
					/>
				) }
			</HStack>
			{ hasReply && <ReplyForm note={ note } currentUser={ currentUser } /> }
		</VStack>
	);
}
