import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
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
import { getNoteExcerpt, getReplyRecipient } from './note-model';
import type { Note, PendingUndoableAction } from './engine';

export type NoteActionKey =
	| 'approve'
	| 'like'
	| 'reply'
	| 'edit'
	| 'spam'
	| 'trash'
	| 'answer-prompt'
	| 'follow';

export type NoteActionItem = {
	key: NoteActionKey;
	label: string;
	isPressed?: boolean;
	href?: string;
	onClick?: () => void;
};

export type NoteActionsState = {
	/** Inline actions, in display order. */
	items: NoteActionItem[];
	/** Actions that belong behind an overflow menu. */
	menuItems: NoteActionItem[];
	mode: 'none' | 'reply' | 'edit';
	close: () => void;
	reply: {
		text: string;
		setText: ( text: string ) => void;
		placeholder: string;
		submit: () => void;
	};
	edit: {
		text: string;
		setText: ( text: string ) => void;
		submit: () => void;
		editLink: string | null;
	};
	isSubmitting: boolean;
	error: string | null;
	clearError: () => void;
	pendingUndoable: PendingUndoableAction | null;
	undo: () => void;
};

/**
 * Everything the per-note action UI needs, as data and callbacks. Drafts and
 * modes reset when the note changes, so callers don't have to remount.
 */
export function useNoteActions( note: Note ): NoteActionsState {
	const actions = useMemo( () => getAvailableNoteActions( note ), [ note ] );
	const isApproved = useIsNoteApproved( note );
	const isLiked = useIsNoteLiked( note );
	const pendingUndoable = usePendingUndoableAction();

	const [ mode, setMode ] = useState< NoteActionsState[ 'mode' ] >( 'none' );
	const [ replyText, setReplyText ] = useState( '' );
	const [ editText, setEditText ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ error, setError ] = useState< string | null >( null );
	const [ follow, setFollow ] = useState( actions.follow );

	useEffect( () => {
		setMode( 'none' );
		setReplyText( '' );
		setEditText( '' );
		setError( null );
		setFollow( actions.follow );
	}, [ note.id, actions.follow ] );

	const close = () => {
		setMode( 'none' );
		setError( null );
	};

	const toggleMode = ( next: 'reply' | 'edit' ) => {
		if ( mode === next ) {
			setMode( 'none' );
			return;
		}
		if ( next === 'edit' ) {
			setEditText( getNoteExcerpt( note ) ?? '' );
		}
		setMode( next );
		setError( null );
	};

	const run = async ( task: () => Promise< void >, failure: string ) => {
		setIsSubmitting( true );
		setError( null );
		try {
			await task();
			setMode( 'none' );
		} catch {
			setError( failure );
		} finally {
			setIsSubmitting( false );
		}
	};

	const submitReply = () => {
		const text = replyText.trim();
		if ( ! text || isSubmitting ) {
			return;
		}
		run( async () => {
			await replyToNote( note, text );
			setReplyText( '' );
		}, __( 'The reply could not be sent. Please try again.' ) );
	};

	const submitEdit = () => {
		const content = editText.trim();
		if ( ! content || isSubmitting ) {
			return;
		}
		run(
			() => editCommentContent( note, content ),
			__( 'The comment could not be updated. Please try again.' )
		);
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

	const items: NoteActionItem[] = [];
	if ( actions.approveComment ) {
		items.push( {
			key: 'approve',
			label: isApproved ? __( 'Approved' ) : __( 'Approve' ),
			isPressed: isApproved,
			onClick: () => setApprovalStatus( note, ! isApproved ),
		} );
	}
	if ( actions.likePost || actions.likeComment ) {
		items.push( {
			key: 'like',
			label: isLiked ? __( 'Liked' ) : __( 'Like' ),
			isPressed: isLiked,
			onClick: () => setLikeStatus( note, ! isLiked ),
		} );
	}
	if ( actions.replyToComment ) {
		items.push( {
			key: 'reply',
			label: __( 'Reply' ),
			isPressed: mode === 'reply',
			onClick: () => toggleMode( 'reply' ),
		} );
	}
	if ( actions.editComment ) {
		items.push( {
			key: 'edit',
			label: __( 'Edit' ),
			isPressed: mode === 'edit',
			onClick: () => toggleMode( 'edit' ),
		} );
	}
	if ( actions.answerPromptHref ) {
		items.push( {
			key: 'answer-prompt',
			label: __( 'Answer prompt' ),
			href: actions.answerPromptHref,
		} );
	}
	if ( follow ) {
		items.push( {
			key: 'follow',
			label: follow.isFollowing ? __( 'Following' ) : __( 'Follow' ),
			isPressed: follow.isFollowing,
			onClick: toggleFollow,
		} );
	}

	const menuItems: NoteActionItem[] = [];
	if ( actions.spamComment ) {
		menuItems.push( { key: 'spam', label: __( 'Mark as spam' ), onClick: () => spamNote( note ) } );
	}
	if ( actions.trashComment ) {
		menuItems.push( {
			key: 'trash',
			label: __( 'Move to trash' ),
			onClick: () => trashNote( note ),
		} );
	}

	const recipient = getReplyRecipient( note );

	return {
		items,
		menuItems,
		mode,
		close,
		reply: {
			text: replyText,
			setText: setReplyText,
			placeholder: recipient
				? /* translators: %s: the person being replied to. */
				  sprintf( __( 'Reply to %s…' ), recipient )
				: __( 'Reply…' ),
			submit: submitReply,
		},
		edit: {
			text: editText,
			setText: setEditText,
			submit: submitEdit,
			editLink: getNoteEditLink( note ) ?? null,
		},
		isSubmitting,
		error,
		clearError: () => setError( null ),
		pendingUndoable,
		undo: undoPendingAction,
	};
}
