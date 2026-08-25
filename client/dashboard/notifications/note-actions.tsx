import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Notice,
	TextareaControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, starEmpty, starFilled, pencil, trash } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import {
	editCommentContent,
	getAvailableNoteActions,
	getNoteEditLink,
	replyToNote,
	setApprovalStatus,
	setFollowStatus,
	setLikeStatus,
	spamNote,
	trashNote,
	undoPendingAction,
	useIsNoteApproved,
	useIsNoteLiked,
	usePendingUndoableAction,
} from './engine';
import { getNoteExcerpt, getNoteSender } from './fields';
import type { Note } from './engine';

function UndoBar() {
	const pending = usePendingUndoableAction();

	if ( ! pending ) {
		return null;
	}

	return (
		<HStack
			className="dashboard-notifications-inbox__undo-bar"
			justify="space-between"
			alignment="center"
		>
			<Text>
				{ pending.kind === 'spam'
					? __( 'Comment marked as spam.' )
					: __( 'Comment moved to trash.' ) }
			</Text>
			<Button variant="link" onClick={ undoPendingAction }>
				{ __( 'Undo' ) }
			</Button>
		</HStack>
	);
}

/**
 * Per-note actions at the top of the detail pane. Render keyed by note id so
 * drafts and modes reset when the selection changes.
 */
export default function NoteActions( { note }: { note: Note } ) {
	const actions = useMemo( () => getAvailableNoteActions( note ), [ note ] );
	const isApproved = useIsNoteApproved( note );
	const isLiked = useIsNoteLiked( note );

	const [ mode, setMode ] = useState< 'none' | 'reply' | 'edit' >( 'none' );
	const [ replyText, setReplyText ] = useState( '' );
	const [ editText, setEditText ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const [ follow, setFollow ] = useState( actions.follow );

	const canLike = actions.likePost || actions.likeComment;
	const hasButtons =
		actions.approveComment ||
		actions.replyToComment ||
		canLike ||
		actions.editComment ||
		actions.spamComment ||
		actions.trashComment ||
		!! actions.answerPromptHref ||
		!! follow;
	const pendingUndoable = usePendingUndoableAction();

	if ( ! hasButtons && ! pendingUndoable ) {
		return null;
	}

	const sender = getNoteSender( note );
	const replyPlaceholder = sender
		? /* translators: %s: the person being replied to. */
		  sprintf( __( 'Reply to %s…' ), sender )
		: __( 'Reply…' );

	const closeInput = () => {
		setMode( 'none' );
		setError( null );
	};

	const startReply = () => {
		setMode( mode === 'reply' ? 'none' : 'reply' );
		setError( null );
	};

	const startEdit = () => {
		if ( mode === 'edit' ) {
			setMode( 'none' );
			return;
		}
		setEditText( getNoteExcerpt( note ) ?? '' );
		setMode( 'edit' );
		setError( null );
	};

	const submitReply = async () => {
		const text = replyText.trim();
		if ( ! text ) {
			return;
		}
		setIsSubmitting( true );
		setError( null );
		try {
			await replyToNote( note, text );
			setReplyText( '' );
			setMode( 'none' );
		} catch {
			setError( __( 'The reply could not be sent. Please try again.' ) );
		} finally {
			setIsSubmitting( false );
		}
	};

	const submitEdit = async () => {
		const content = editText.trim();
		if ( ! content ) {
			return;
		}
		setIsSubmitting( true );
		setError( null );
		try {
			await editCommentContent( note, content );
			setMode( 'none' );
		} catch {
			setError( __( 'The comment could not be updated. Please try again.' ) );
		} finally {
			setIsSubmitting( false );
		}
	};

	const toggleFollow = async () => {
		if ( ! follow ) {
			return;
		}
		const previous = follow;
		const shouldFollow = ! follow.isFollowing;
		setFollow( { ...follow, isFollowing: shouldFollow } );
		try {
			const isFollowing = await setFollowStatus( note, follow.siteId, shouldFollow );
			setFollow( { siteId: previous.siteId, isFollowing } );
		} catch {
			setFollow( previous );
		}
	};

	const editLink = getNoteEditLink( note );

	return (
		<VStack spacing={ 3 } className="dashboard-notifications-inbox__actions">
			<UndoBar />
			{ hasButtons && (
				<HStack justify="flex-start" spacing={ 1 } wrap>
					{ actions.approveComment && (
						<Button
							variant="secondary"
							icon={ check }
							isPressed={ isApproved }
							onClick={ () => setApprovalStatus( note, ! isApproved ) }
						>
							{ isApproved ? __( 'Approved' ) : __( 'Approve' ) }
						</Button>
					) }
					{ actions.replyToComment && (
						<Button variant="secondary" isPressed={ mode === 'reply' } onClick={ startReply }>
							{ __( 'Reply' ) }
						</Button>
					) }
					{ canLike && (
						<Button
							variant="secondary"
							icon={ isLiked ? starFilled : starEmpty }
							isPressed={ isLiked }
							onClick={ () => setLikeStatus( note, ! isLiked ) }
						>
							{ isLiked ? __( 'Liked' ) : __( 'Like' ) }
						</Button>
					) }
					{ actions.editComment && (
						<Button
							variant="secondary"
							icon={ pencil }
							isPressed={ mode === 'edit' }
							onClick={ startEdit }
						>
							{ __( 'Edit' ) }
						</Button>
					) }
					{ actions.spamComment && (
						<Button variant="secondary" isDestructive onClick={ () => spamNote( note ) }>
							{ __( 'Spam' ) }
						</Button>
					) }
					{ actions.trashComment && (
						<Button
							variant="secondary"
							icon={ trash }
							isDestructive
							onClick={ () => trashNote( note ) }
						>
							{ __( 'Trash' ) }
						</Button>
					) }
					{ actions.answerPromptHref && (
						<Button
							variant="secondary"
							href={ actions.answerPromptHref }
							target="_blank"
							rel="noreferrer"
						>
							{ __( 'Answer prompt' ) }
						</Button>
					) }
					{ follow && (
						<Button variant="secondary" isPressed={ follow.isFollowing } onClick={ toggleFollow }>
							{ follow.isFollowing ? __( 'Following' ) : __( 'Follow' ) }
						</Button>
					) }
				</HStack>
			) }
			{ error && (
				<Notice status="error" isDismissible onRemove={ () => setError( null ) }>
					{ error }
				</Notice>
			) }
			{ mode === 'reply' && (
				<VStack spacing={ 2 }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Reply' ) }
						hideLabelFromVision
						placeholder={ replyPlaceholder }
						value={ replyText }
						onChange={ setReplyText }
						rows={ 3 }
						disabled={ isSubmitting }
					/>
					<HStack justify="flex-start" spacing={ 2 }>
						<Button
							variant="primary"
							isBusy={ isSubmitting }
							disabled={ isSubmitting || ! replyText.trim() }
							onClick={ submitReply }
						>
							{ __( 'Send reply' ) }
						</Button>
						<Button variant="tertiary" disabled={ isSubmitting } onClick={ closeInput }>
							{ __( 'Cancel' ) }
						</Button>
					</HStack>
				</VStack>
			) }
			{ mode === 'edit' && (
				<VStack spacing={ 2 }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Edit comment' ) }
						hideLabelFromVision
						value={ editText }
						onChange={ setEditText }
						rows={ 4 }
						disabled={ isSubmitting }
					/>
					<HStack justify="flex-start" spacing={ 2 }>
						<Button
							variant="primary"
							isBusy={ isSubmitting }
							disabled={ isSubmitting || ! editText.trim() }
							onClick={ submitEdit }
						>
							{ __( 'Save' ) }
						</Button>
						<Button variant="tertiary" disabled={ isSubmitting } onClick={ closeInput }>
							{ __( 'Cancel' ) }
						</Button>
						{ editLink && (
							<Button variant="link" href={ editLink } target="_blank" rel="noreferrer">
								{ __( 'Open in editor' ) }
							</Button>
						) }
					</HStack>
				</VStack>
			) }
		</VStack>
	);
}
