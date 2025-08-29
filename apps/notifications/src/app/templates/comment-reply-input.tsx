import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	TextareaControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import debugModule from 'debug';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import repliesCache from '../../panel/comment-replies-cache';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import { recordTracksEvent } from '../../panel/helpers/stats';
import { bumpStat } from '../../panel/rest-client/bump-stat';
import { wpcom } from '../../panel/rest-client/wpcom';
import actions from '../../panel/state/actions';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import Suggestions from '../../panel/suggestions';
import { useAppContext } from '../context';
import type { Note } from '../types';
import type { FormEvent } from 'react';

const debug = debugModule( 'notifications:reply' );

function stopEvent( event: KeyboardEvent | FormEvent ) {
	event.stopPropagation();
	event.preventDefault();
}

function getRowCount( textareaElement: HTMLTextAreaElement | null ) {
	if ( ! textareaElement ) {
		return 1;
	}

	// Reset to minimum rows first
	textareaElement.rows = 1;

	// Calculate the required rows
	const style = window.getComputedStyle( textareaElement );
	const lineHeight = ! isNaN( parseInt( style.lineHeight ) ) ? parseInt( style.lineHeight ) : 20;
	const rows = Math.min( Math.floor( textareaElement.scrollHeight / lineHeight ), 4 );

	// Set to latest rows
	textareaElement.rows = Math.max( rows, 1 );

	return textareaElement.rows;
}

// TODO:
// 1. Handle the response of the reply
// 2. Route back to list after successful comment post (should we?)
const CommentReplyInput = ( { note, defaultValue }: { note: Note; defaultValue: string } ) => {
	const dispatch = useDispatch();
	const { client } = useAppContext();
	const keyboardShortcutsAreEnabled = useSelector( ( state ) =>
		getKeyboardShortcutsEnabled( state )
	);

	const replyInputRef = useRef< HTMLTextAreaElement | null >( null );
	const savedReplyKey = `reply_${ note.id }`;
	const savedReply = repliesCache.getItem( savedReplyKey );
	const [ value, setValue ] = useState( savedReply ? savedReply[ 0 ] : '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const isSubmittingRef = useRef( false );
	const retryCountRef = useRef( 0 );

	isSubmittingRef.current = isSubmitting;

	const handleSubmit = useCallback(
		( event?: FormEvent ) => {
			if ( event ) {
				stopEvent( event );
			}

			if ( ! replyInputRef.current || ! replyInputRef.current.value ) {
				return;
			}

			if ( isSubmittingRef.current ) {
				return;
			}

			setIsSubmitting( true );

			if ( retryCountRef.current === 0 ) {
				bumpStat( 'notes-click-action', 'replyto-comment' );
				recordTracksEvent( 'calypso_notification_note_reply', {
					note_type: note.type,
				} );
			}

			let wpObject;
			let submitComment;
			if ( note.meta.ids.comment ) {
				wpObject = wpcom().site( note.meta.ids.site ).comment( note.meta.ids.comment );
				submitComment = wpObject.reply;
			} else {
				wpObject = wpcom().site( note.meta.ids.site ).post( note.meta.ids.post ).comment();
				submitComment = wpObject.add;
			}

			submitComment.call( wpObject, replyInputRef.current.value, ( error: Error | null ) => {
				if ( error ) {
					if ( retryCountRef.current < 3 ) {
						retryCountRef.current = retryCountRef.current + 1;
						window.setTimeout( () => handleSubmit(), 2000 * retryCountRef.current );
					} else {
						setIsSubmitting( false );
						retryCountRef.current = 0;
						replyInputRef.current?.focus();
						debug( 'Failed to submit comment reply: %s', error.message );
					}
					return;
				}

				if ( note.meta.ids.comment ) {
					// pre-emptively approve the comment if it wasn't already
					dispatch( actions.notes.approveNote( note.id, true ) );
					client?.getNote( note.id );
				}

				// remove focus from textarea so we can resume using keyboard
				// shortcuts without typing in the field
				replyInputRef.current?.blur();

				setValue( '' );
				setIsSubmitting( false );
				retryCountRef.current = 0;

				// remove the comment reply from local storage
				repliesCache.removeItem( savedReplyKey );
			} );
		},
		[ client, note, savedReplyKey, isSubmittingRef, dispatch ]
	);

	const handleChange = ( value: string ) => {
		setValue( value );

		// persist the comment reply on local storage
		if ( savedReplyKey ) {
			repliesCache.setItem( savedReplyKey, [ value, Date.now() ] );
		}
	};

	const handleFocus = () => {
		dispatch( actions.ui.disableKeyboardShortcuts() );
	};

	const handleBlur = () => {
		dispatch( actions.ui.enableKeyboardShortcuts() );

		// Reset the field if there's no valid user input
		// The regex strips whitespace
		if ( '' === value.replace( /^\s+|\s+$/g, '' ) ) {
			setValue( '' );
		}
	};

	const insertSuggestion = ( suggestion: { user_login: string }, suggestionsQuery: string ) => {
		if ( ! suggestion ) {
			return;
		}

		const element = replyInputRef.current;
		const caretPosition = element?.selectionStart ?? 0;
		const startString = value.slice( 0, Math.max( caretPosition - suggestionsQuery.length, 0 ) );
		const endString = value.slice( caretPosition );

		setValue( startString + suggestion.user_login + ' ' + endString );

		element?.focus();

		// move the caret after the inserted suggestion
		const insertPosition = startString.length + suggestion.user_login.length + 1;
		setTimeout( () => element?.setSelectionRange( insertPosition, insertPosition ), 0 );
	};

	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( ! keyboardShortcutsAreEnabled ) {
				return;
			}

			if ( modifierKeyIsActive( event ) ) {
				return;
			}

			if ( 'r' === event.key.toLowerCase() ) {
				/* 'r' key */
				replyInputRef.current?.focus();
				stopEvent( event );
			}
		};

		const handleCtrlEnter = ( event: KeyboardEvent ) => {
			if ( ( event.ctrlKey || event.metaKey ) && 'Enter' === event.key ) {
				stopEvent( event );
				handleSubmit();
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		window.addEventListener( 'keydown', handleCtrlEnter, false );

		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
			window.removeEventListener( 'keydown', handleCtrlEnter, false );
		};
	}, [ keyboardShortcutsAreEnabled, handleSubmit ] );

	return (
		<VStack>
			<form onSubmit={ handleSubmit }>
				<HStack spacing={ 4 } alignment="flex-start">
					<TextareaControl
						className="comment-reply-input__textarea"
						ref={ replyInputRef }
						rows={ getRowCount( replyInputRef.current ) }
						value={ value }
						placeholder={ defaultValue }
						__nextHasNoMarginBottom
						onFocus={ handleFocus }
						onBlur={ handleBlur }
						onChange={ handleChange }
					/>
					<Button
						type="submit"
						variant="primary"
						title={
							value.length ? __( 'Submit reply' ) : __( 'Write your response in order to submit' )
						}
						isBusy={ isSubmitting }
						disabled={ ! value.length }
						__next40pxDefaultSize
					>
						{ __( 'Send' ) }
					</Button>
				</HStack>
			</form>
			<Suggestions
				site={ note.meta.ids.site }
				onInsertSuggestion={ insertSuggestion }
				getContextEl={ () => replyInputRef.current }
			/>
		</VStack>
	);
};

export default CommentReplyInput;
