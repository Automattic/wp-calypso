import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Popover, VisuallyHidden } from '@wordpress/ui';
import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context';
import NoteIcon from '../note-icon';
import { formatNoteTime } from '../note-simplified/format-note-time';
import type { Note } from '../types';
import type { PointerEvent } from 'react';

import './style.scss';

const SHOW_DELAY = 300;
// Long enough to cross the gap between two rows, or from a row onto the card.
const HIDE_DELAY = 90;

type Peek = { noteId: string; anchor: HTMLElement };

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
	const [ peek, setPeek ] = useState< Peek | null >( null );
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
			setPeek( null );
		}
	}, [ isEnabled ] );

	// Escape closes the preview before anything else, like the panel around it. The row
	// stays hovered, so the preview doesn't come back until the pointer moves to another.
	const isShown = peek !== null;
	useEffect( () => {
		if ( ! isShown ) {
			return;
		}
		const onKeyDown = ( event: KeyboardEvent ) => {
			if ( event.key === 'Escape' ) {
				event.stopPropagation();
				window.clearTimeout( hideTimerRef.current );
				setPeek( null );
			}
		};
		window.addEventListener( 'keydown', onKeyDown, true );
		return () => window.removeEventListener( 'keydown', onKeyDown, true );
	}, [ isShown ] );

	const hide = () => {
		hoveredRowRef.current = null;
		window.clearTimeout( showTimerRef.current );
		window.clearTimeout( hideTimerRef.current );
		hideTimerRef.current = window.setTimeout( () => setPeek( null ), HIDE_DELAY );
	};

	const onPointerOver = ( event: PointerEvent< HTMLElement > ) => {
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
			?.querySelector< HTMLElement >( '.dataviews-view-list__item' );
		const noteId = row && getNoteId( row );
		if ( ! row || ! noteId ) {
			hide();
			return;
		}
		if ( row === hoveredRowRef.current ) {
			return;
		}
		hoveredRowRef.current = row;
		clearTimers();
		const show = () => setPeek( { noteId, anchor: row } );
		if ( peek ) {
			show();
		} else {
			showTimerRef.current = window.setTimeout( () => {
				show();
				onShow( noteId );
			}, SHOW_DELAY );
		}
	};

	const dismiss = () => {
		clearTimers();
		hoveredRowRef.current = null;
		setPeek( null );
	};

	return {
		peek,
		dismiss,
		listProps: { onPointerOver, onPointerLeave: hide, onPointerDown: dismiss },
	};
}

/**
 * A preview of a note beside its row: where it happened, who, when, and what they said.
 */
export default function NotePeek( {
	note,
	anchor,
	onClose,
}: {
	note: Note;
	anchor: HTMLElement;
	onClose: () => void;
} ) {
	const { locale } = useAppContext();
	const { site, post, actor } = note.meta ?? {};
	// The comment or post itself, where the row shows a line or two of it.
	const text =
		note.body.find( ( block ) => block.type === 'comment' || block.type === 'post' )?.text ??
		note.meta?.parent_comment?.text;

	return (
		<Popover.Root open onOpenChange={ ( open: boolean ) => ! open && onClose() }>
			<Popover.Popup
				className="wpnc-peek"
				initialFocus={ false }
				finalFocus={ false }
				positioner={
					<Popover.Positioner anchor={ anchor } side="left" align="start" sideOffset={ 12 } />
				}
			>
				<VisuallyHidden render={ <Popover.Title /> }>
					{ __( 'Notification preview' ) }
				</VisuallyHidden>
				<VStack spacing={ 3 }>
					{ ( site || post ) && (
						<VStack spacing={ 0 }>
							{ site && (
								<Text size={ 12 } lineHeight="16px" truncate>
									{ site.name }
								</Text>
							) }
							{ post && (
								<Text weight={ 600 } lineHeight="20px" truncate>
									{ post.title }
								</Text>
							) }
						</VStack>
					) }
					{ actor && (
						<HStack spacing={ 2 } justify="flex-start">
							<NoteIcon icon={ actor.avatar } size={ 24 } />
							<Text weight={ 600 } lineHeight="20px" truncate>
								{ actor.name }
							</Text>
							<Text className="wpnc-peek__time" size={ 12 } lineHeight="16px" variant="muted">
								{ formatNoteTime( note.timestamp, locale ) }
							</Text>
						</HStack>
					) }
					{ text && (
						<Text lineHeight="20px" numberOfLines={ 6 } truncate>
							{ text.trim() }
						</Text>
					) }
				</VStack>
			</Popover.Popup>
		</Popover.Root>
	);
}
