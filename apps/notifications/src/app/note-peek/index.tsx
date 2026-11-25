import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Popover, VisuallyHidden } from '@wordpress/ui';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { html } from '../../panel/indices-to-html';
import { p } from '../../panel/templates/functions';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import { formatNoteTime } from '../note-simplified/format-note-time';
import type { Note } from '../types';
import type { FocusEvent, MouseEvent, PointerEvent, SyntheticEvent } from 'react';

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
 * What the row is missing, beside it: what a note answers or is on, and when, then the
 * reply, the passage that mentions you, the people who liked something, or a post's
 * opening. The row already shows who, so the card doesn't repeat them.
 */
export default function NotePeek( {
	note,
	isOpen,
	anchor,
	isMove,
	onClose,
	onOpen,
}: {
	note: Note;
	isOpen: boolean;
	anchor: Element;
	isMove?: boolean;
	onClose: () => void;
	onOpen: () => void;
} ) {
	const { locale } = useAppContext();
	const { post, parent_comment: repliedTo, actor_count: actorCount } = note.meta ?? {};
	const isLikes = note.type === 'like' || note.type === 'comment_like';
	const isReply = note.type === 'comment' && !! repliedTo;
	// The comment or post itself, where the row shows a line or two of it. Its ranges mark
	// the headings, paragraphs, emphasis and, in a mention, where you're named.
	const block = isLikes
		? undefined
		: note.body.find( ( { type } ) => type === 'comment' || type === 'post' );
	const people = isLikes ? note.body.filter( ( { type } ) => type === 'user' ) : [];
	const otherCount = Math.max( 0, ( actorCount ?? 0 ) - people.length );

	// Always the post a note is on, which most rows don't name. A new post's row already
	// does, so its card says how long it is instead. A reply's quote says what it answers.
	let context;
	if ( note.type === 'new_post' ) {
		const minutes = Math.max( 1, Math.round( ( block?.text.split( /\s+/ ).length ?? 0 ) / 200 ) );
		/* translators: %d is how many minutes a post takes to read. */
		context = sprintf( _n( '%d min read', '%d min read', minutes ), minutes );
	} else if ( post?.title ) {
		/* translators: %s is the title of the post a note is on. */
		context = sprintf( __( 'On %s' ), post.title );
	}

	// Opens the note, like its row. Not when following a link or selecting text in the card.
	const openNote = ( event: MouseEvent< HTMLElement > ) => {
		if ( ( event.target as Element ).closest( 'a' ) || window.getSelection()?.toString() ) {
			return;
		}
		onOpen();
	};

	return (
		<Popover.Root open={ isOpen } onOpenChange={ ( open: boolean ) => ! open && onClose() }>
			<Popover.Popup
				className="wpnc-peek"
				initialFocus={ false }
				finalFocus={ false }
				onClick={ openNote }
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
					<HStack spacing={ 2 }>
						<Text className="wpnc-peek__context" size={ 12 } lineHeight="16px" variant="muted">
							{ context }
						</Text>
						<Text className="wpnc-peek__time" size={ 12 } lineHeight="16px" variant="muted">
							{ formatNoteTime( note.timestamp, locale ) }
						</Text>
					</HStack>
					{ isReply &&
						p(
							html( repliedTo.content ?? { text: repliedTo.text } ),
							'wpnc-peek__quote wpnc-simplified__quiet-links'
						) }
					{ block?.text.trim() &&
						p( html( block ), 'wpnc-peek__text wpnc-simplified__quiet-links' ) }
					{ people.length > 0 && (
						<VStack spacing={ 2 }>
							<HStack className="wpnc-peek__faces" spacing={ 0 } justify="flex-start">
								{ people.map( ( person, index ) => (
									<NoteIcon key={ index } icon={ person.media?.[ 0 ]?.url } size={ 20 } />
								) ) }
							</HStack>
							<Text size={ 13 } lineHeight="20px">
								{ otherCount > 0
									? sprintf(
											/* translators: %1$s is a list of names, %2$d how many more people there are. */
											_n( '%1$s and %2$d other', '%1$s and %2$d others', otherCount ),
											people.map( ( { text } ) => text ).join( ', ' ),
											otherCount
										)
									: people.map( ( { text } ) => text ).join( ', ' ) }
							</Text>
						</VStack>
					) }
				</VStack>
			</Popover.Popup>
		</Popover.Root>
	);
}
