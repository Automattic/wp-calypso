import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Popover, VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { html } from '../../panel/indices-to-html';
import { p } from '../../panel/templates/functions';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import { isPostNote } from '../note-simplified';
import { formatNoteTime } from '../note-simplified/format-note-time';
import type { Note } from '../types';
import type { FocusEvent, PointerEvent, SyntheticEvent } from 'react';

import './style.scss';

const SHOW_DELAY = 300;
// Long enough to cross the gap between two rows, or from a row onto the card.
const HIDE_DELAY = 90;

/**
 * Shows a preview of a note's row after the pointer rests on it, or the arrow keys move
 * to it. Once the preview is showing, moving to another row swaps it at once.
 */
export function useNotePeek( {
	isEnabled,
	getNoteId,
	onShow,
}: {
	isEnabled: boolean;
	getNoteId: ( row: Element ) => string | undefined;
	onShow: ( noteId: string ) => void;
} ) {
	// The last note shown stays set after the card closes, so it can fade out.
	// `isMove` marks a swap to another row while open, the only change the card glides for.
	const [ peek, setPeek ] = useState< { noteId: string; anchor: Element; isMove: boolean } >();
	const [ isOpen, setIsOpen ] = useState( false );
	const activeRowRef = useRef< Element | null >( null );
	const isFromKeyboardRef = useRef( false );
	const showTimerRef = useRef< number >( undefined );
	const hideTimerRef = useRef< number >( undefined );

	const clearTimers = () => {
		window.clearTimeout( showTimerRef.current );
		window.clearTimeout( hideTimerRef.current );
	};

	useEffect( () => clearTimers, [] );

	useEffect( () => {
		if ( ! isEnabled ) {
			clearTimers();
			activeRowRef.current = null;
			setIsOpen( false );
		}
	}, [ isEnabled ] );

	// Escape closes the preview before anything else, like the panel around it. The row
	// stays hovered, so the preview doesn't come back until the pointer moves to another.
	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}
		const onKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				event.stopPropagation();
				window.clearTimeout( hideTimerRef.current );
				setIsOpen( false );
			}
		};
		window.addEventListener( 'keydown', onKeyDown, true );
		return () => window.removeEventListener( 'keydown', onKeyDown, true );
	}, [ isOpen ] );

	const close = () => {
		clearTimers();
		activeRowRef.current = null;
		setIsOpen( false );
	};

	const hide = () => {
		activeRowRef.current = null;
		clearTimers();
		hideTimerRef.current = window.setTimeout( () => setIsOpen( false ), HIDE_DELAY );
	};

	// Shows the preview for the row holding `target`, or hides it off the rows.
	const track = ( target: Element ) => {
		const row = target
			.closest( '.dataviews-view-list__item-wrapper' )
			?.querySelector( '.dataviews-view-list__item' );
		const rowNoteId = row && getNoteId( row );
		if ( ! row || ! rowNoteId ) {
			hide();
			return;
		}
		if ( row === activeRowRef.current ) {
			return;
		}
		activeRowRef.current = row;
		clearTimers();
		if ( isOpen ) {
			setPeek( { noteId: rowNoteId, anchor: row, isMove: true } );
			return;
		}
		showTimerRef.current = window.setTimeout( () => {
			setPeek( { noteId: rowNoteId, anchor: row, isMove: false } );
			setIsOpen( true );
			onShow( rowNoteId );
		}, SHOW_DELAY );
	};

	// The card renders in a portal, so it's outside the list but its events still reach it.
	const isFromCard = ( event: SyntheticEvent< HTMLElement > ) =>
		! event.currentTarget.contains( event.target as Node );

	const onPointer = ( event: PointerEvent< HTMLElement > ) => {
		if ( ! isEnabled || event.pointerType !== 'mouse' ) {
			return;
		}
		if ( isFromCard( event ) ) {
			window.clearTimeout( hideTimerRef.current );
			return;
		}
		isFromKeyboardRef.current = false;
		track( event.target as Element );
	};

	// For a row the arrow keys moved to, like resting the pointer on it.
	const preview = ( target: Element ) => {
		if ( isEnabled ) {
			isFromKeyboardRef.current = true;
			track( target );
		}
	};

	const onBlur = ( event: FocusEvent< HTMLElement > ) => {
		if ( ! event.currentTarget.contains( event.relatedTarget ) ) {
			hide();
		}
	};

	return {
		noteId: peek?.noteId,
		anchor: peek?.anchor,
		isMove: peek?.isMove,
		isOpen,
		close,
		preview,
		listProps: {
			onPointerOver: onPointer,
			// Also on move, for a pointer that settles on a row it was already over, after a scroll.
			onPointerMove: onPointer,
			onPointerLeave: hide,
			// Pressing a row opens it; pressing the card, say to select its text, keeps it.
			onPointerDown: ( event: PointerEvent< HTMLElement > ) => ! isFromCard( event ) && close(),
			onBlur,
			// Rows pass under a still pointer while the list scrolls, so the preview waits
			// for the pointer to rest again. The arrow keys scroll their row into view, and
			// the preview follows it.
			onScrollCapture: () => ! isFromKeyboardRef.current && close(),
		},
	};
}

/**
 * A preview of a note beside its row: who and when on one line, then what the row has
 * only a line or two of, in the note's own formatting.
 */
export default function NotePeek( {
	note,
	isOpen,
	anchor,
	isMove,
	onClose,
}: {
	note: Note;
	isOpen: boolean;
	anchor: Element;
	isMove?: boolean;
	onClose: () => void;
} ) {
	const { locale } = useAppContext();
	const actor = note.meta?.actor;
	// The post a comment is on, which its row doesn't name. A post's own title is in its row.
	const postTitle = ! isPostNote( note ) && note.meta?.post?.title;
	// The comment or post itself, where the row shows a line or two of it. Its ranges mark
	// the headings, paragraphs and emphasis, as in the open note.
	const block =
		note.body.find( ( { type } ) => type === 'comment' || type === 'post' ) ??
		( note.meta?.parent_comment && { text: note.meta.parent_comment.text } );

	return (
		<Popover.Root open={ isOpen } onOpenChange={ ( open: boolean ) => ! open && onClose() }>
			<Popover.Popup
				className="wpnc-peek"
				initialFocus={ false }
				finalFocus={ false }
				positioner={
					<Popover.Positioner
						className={ clsx( 'wpnc-peek__positioner', { 'is-moving': isMove } ) }
						anchor={ anchor }
						side="left"
						align="start"
						sideOffset={ 12 }
					/>
				}
			>
				<VisuallyHidden render={ <Popover.Title /> }>
					{ __( 'Notification preview' ) }
				</VisuallyHidden>
				<VStack spacing={ 2 }>
					{ /* Who's speaking, on one line, so the text doesn't read as nobody's. The row's
					     icon is this person, and already loaded. */ }
					<HStack spacing={ 1.5 } justify="flex-start">
						<NoteIcon icon={ note.icon || actor?.avatar } size={ 16 } />
						<Text className="wpnc-peek__byline" size={ 12 } lineHeight="16px" variant="muted">
							<span className="wpnc-simplified__card-author wpnc-peek__author">
								{ actor?.name }
							</span>{ ' ' }
							{ postTitle &&
								sprintf(
									/* translators: %s is the title of the post a comment is on. */
									__( 'on %s' ),
									postTitle
								) }
						</Text>
						<Text className="wpnc-peek__time" size={ 12 } lineHeight="16px" variant="muted">
							{ formatNoteTime( note.timestamp, locale ) }
						</Text>
					</HStack>
					{ block?.text.trim() &&
						p( html( block ), 'wpnc-peek__text wpnc-simplified__quiet-links' ) }
				</VStack>
			</Popover.Popup>
		</Popover.Root>
	);
}
