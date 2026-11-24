import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Popover, VisuallyHidden } from '@wordpress/ui';
import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context';
import { formatNoteTime } from '../note-simplified/format-note-time';
import Author from '../note-simplified/parts/author';
import SiteIdentity from '../note-simplified/parts/site-identity';
import type { Note } from '../types';
import type { PointerEvent } from 'react';

import './style.scss';

const SHOW_DELAY = 300;
// Long enough to cross the gap between two rows, or from a row onto the card.
const HIDE_DELAY = 90;

/**
 * Shows a preview of a note's row after the pointer rests on it. Once the preview is
 * showing, moving to another row swaps it at once.
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
	const [ peek, setPeek ] = useState< { noteId: string; anchor: Element } >();
	const [ isOpen, setIsOpen ] = useState( false );
	const hoveredRowRef = useRef< Element | null >( null );
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
			hoveredRowRef.current = null;
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
		hoveredRowRef.current = null;
		setIsOpen( false );
	};

	const hide = () => {
		hoveredRowRef.current = null;
		clearTimers();
		hideTimerRef.current = window.setTimeout( () => setIsOpen( false ), HIDE_DELAY );
	};

	const onPointer = ( event: PointerEvent< HTMLElement > ) => {
		if ( ! isEnabled || event.pointerType !== 'mouse' ) {
			return;
		}
		// The card renders in a portal, so it's outside the list but its events still reach it.
		if ( ! event.currentTarget.contains( event.target as Node ) ) {
			window.clearTimeout( hideTimerRef.current );
			return;
		}
		const row = ( event.target as Element )
			.closest( '.dataviews-view-list__item-wrapper' )
			?.querySelector( '.dataviews-view-list__item' );
		const rowNoteId = row && getNoteId( row );
		if ( ! row || ! rowNoteId ) {
			hide();
			return;
		}
		if ( row === hoveredRowRef.current ) {
			return;
		}
		hoveredRowRef.current = row;
		clearTimers();
		if ( isOpen ) {
			setPeek( { noteId: rowNoteId, anchor: row } );
			return;
		}
		showTimerRef.current = window.setTimeout( () => {
			setPeek( { noteId: rowNoteId, anchor: row } );
			setIsOpen( true );
			onShow( rowNoteId );
		}, SHOW_DELAY );
	};

	return {
		noteId: peek?.noteId,
		anchor: peek?.anchor,
		isOpen,
		close,
		listProps: {
			onPointerOver: onPointer,
			// Also on move, for a pointer that settles on a row it was already over, after a scroll.
			onPointerMove: onPointer,
			onPointerLeave: hide,
			onPointerDown: close,
			// Rows pass under a still pointer while the list scrolls, so the preview waits
			// for the pointer to rest again.
			onScrollCapture: close,
		},
	};
}

/**
 * A preview of a note beside its row, in the parts the note itself uses: the site and
 * post, who and when, and what they said.
 */
export default function NotePeek( {
	note,
	isOpen,
	anchor,
	onClose,
}: {
	note: Note;
	isOpen: boolean;
	anchor: Element;
	onClose: () => void;
} ) {
	const { locale } = useAppContext();
	const { site, post, actor } = note.meta ?? {};
	// The comment or post itself, where the row shows a line or two of it.
	const text = (
		note.body.find( ( block ) => block.type === 'comment' || block.type === 'post' )?.text ??
		note.meta?.parent_comment?.text
	)
		?.trim()
		.replace( /\n\s*\n+/g, '\n' );

	return (
		<Popover.Root open={ isOpen } onOpenChange={ ( open: boolean ) => ! open && onClose() }>
			<Popover.Popup
				className="wpnc-peek"
				initialFocus={ false }
				finalFocus={ false }
				positioner={
					<Popover.Positioner
						className="wpnc-peek__positioner"
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
				<VStack spacing={ 3 }>
					{ site ? (
						<SiteIdentity site={ site } title={ post?.title } details={ post && site.name } />
					) : (
						post && (
							<Text weight={ 600 } lineHeight="20px" truncate>
								{ post.title }
							</Text>
						)
					) }
					{ actor && (
						<HStack spacing={ 2 } justify="flex-start">
							<Text weight={ 500 } lineHeight="20px" truncate>
								{ /* The row's icon is this person, and already loaded. */ }
								<Author avatar={ note.icon || actor.avatar }>{ actor.name }</Author>
							</Text>
							<Text className="wpnc-peek__time" size={ 12 } lineHeight="16px" variant="muted">
								{ formatNoteTime( note.timestamp, locale ) }
							</Text>
						</HStack>
					) }
					{ text && (
						<Text className="wpnc-peek__text" lineHeight="20px" numberOfLines={ 5 } truncate>
							{ text }
						</Text>
					) }
				</VStack>
			</Popover.Popup>
		</Popover.Root>
	);
}
