import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Modal,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { reportRequestError } from '../../panel/helpers/log-error';
import { recordTracksEvent } from '../../panel/helpers/stats';
import { listNotes } from '../../panel/rest-client/wpcom';
import { markAllRead } from '../../panel/state/notes/thunks';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsNoteRead from '../../panel/state/selectors/get-is-note-read';
import { useAppContext } from '../context';
import type { Note } from '../types';
import type { KeyboardEvent } from 'react';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

// The most notes the server lists in one request. An account with more unread notes than this
// is shown as having "this many or more".
export const UNREAD_IDS_LIMIT = 200;

// About two screens of rows. Above it, most of what's marked hasn't been seen, so the link asks first.
export const CONFIRM_ABOVE = 20;

const getNewestNoteKey = ( state: unknown ) => {
	const [ newestNote ] = getAllNotes( state ) as Note[];
	return newestNote && `${ newestNote.id }:${ newestNote.timestamp }`;
};

/**
 * Counts the unread notes on the account, loaded or not.
 *
 * The server's list of unread notes is fetched again whenever a newer note arrives. Between
 * fetches, notes read or left unread on this device adjust the count. Until the first list
 * arrives the count is 0, since the loaded notes alone would undercount the account. While the
 * list for a newer note is on its way, or if it can't be fetched, the count says "or more":
 * marking all as read reaches up to the newest note, so it can mark notes the count missed.
 */
function useUnreadCount() {
	const store = useStore();
	const [ unreadIds, setUnreadIds ] = useState< number[] >( [] );
	const [ isCounted, setIsCounted ] = useState( false );
	// The newest note when the unread notes were last listed.
	const [ countedNoteKey, setCountedNoteKey ] = useState< string >();
	const requestRef = useRef( 0 );

	const newestNoteKey = useSelector( getNewestNoteKey );

	const refresh = useCallback( async () => {
		const request = ++requestRef.current;
		const noteKey = getNewestNoteKey( store.getState() );
		try {
			const { notes } = await listNotes( { unread: 1, fields: 'id', number: UNREAD_IDS_LIMIT } );
			if ( request === requestRef.current ) {
				setUnreadIds( notes.map( ( { id }: { id: number } ) => id ) );
				setCountedNoteKey( noteKey );
				setIsCounted( true );
			}
		} catch ( error ) {
			reportRequestError( 'load-unread-count', error );
			if ( request === requestRef.current ) {
				setIsCounted( true );
			}
		}
	}, [ store ] );

	useEffect( () => {
		if ( newestNoteKey ) {
			refresh();
		}
	}, [ newestNoteKey, refresh ] );

	const count = useSelector( ( state ) => {
		const ids = new Set( unreadIds );
		( getAllNotes( state ) as Note[] ).forEach( ( note ) => {
			if ( getIsNoteRead( state, note ) ) {
				ids.delete( note.id );
			} else {
				ids.add( note.id );
			}
		} );
		return ids.size;
	} );

	return {
		count: newestNoteKey && isCounted ? count : 0,
		hasMore: countedNoteKey !== newestNoteKey || unreadIds.length >= UNREAD_IDS_LIMIT,
		refresh,
	};
}

type MarkAllAsReadProps = {
	/** Called when the link held the focus and went away because nothing is unread any more. */
	onFocusLost?: () => void;
};

/**
 * A "Mark N as read" link that marks every unread note on the account as read. Above
 * `CONFIRM_ABOVE` notes it asks first, in a modal.
 */
export default function MarkAllAsRead( { onFocusLost }: MarkAllAsReadProps ) {
	const { client } = useAppContext();
	const dispatch = useDispatch< ThunkDispatch< unknown, unknown, UnknownAction > >();
	const { count, hasMore, refresh } = useUnreadCount();
	const [ isBusy, setIsBusy ] = useState( false );
	const [ hasError, setHasError ] = useState( false );
	const [ isConfirming, setIsConfirming ] = useState( false );
	const wrapperRef = useRef< HTMLDivElement >( null );
	const refocusRef = useRef( false );
	// The modal's close button, Esc and outside click call `onRequestClose` after its exit
	// animation, so another close or a click on Mark all as read can come first. Only the first
	// one counts.
	const isConfirmingRef = useRef( false );

	const needsConfirm = hasMore || count > CONFIRM_ABOVE;

	const markAll = async ( { fromModal = false } = {} ) => {
		// The modal returns the focus to the link as it closes, after this runs.
		refocusRef.current = fromModal || !! wrapperRef.current?.contains( document.activeElement );
		setIsBusy( true );
		setHasError( false );

		const isMarked = await dispatch( markAllRead( client ) );
		if ( isMarked ) {
			await refresh();
		} else {
			refocusRef.current = false;
		}

		setHasError( ! isMarked );
		setIsBusy( false );
	};

	const handleClick = () => {
		if ( needsConfirm ) {
			setHasError( false );
			isConfirmingRef.current = true;
			setIsConfirming( true );
			return;
		}
		markAll();
	};

	const stopConfirming = () => {
		const wasConfirming = isConfirmingRef.current;
		isConfirmingRef.current = false;
		return wasConfirming;
	};

	const cancel = () => {
		if ( stopConfirming() ) {
			recordTracksEvent( 'calypso_notification_mark_all_read_cancel', {
				count,
				has_more: hasMore,
			} );
		}
	};

	const handleConfirm = () => {
		setIsConfirming( false );
		if ( stopConfirming() ) {
			markAll( { fromModal: true } );
		}
	};

	const handleCancel = () => {
		setIsConfirming( false );
		cancel();
	};

	// Esc cancels as it's pressed, so that Enter on Mark all as read during the exit animation does nothing.
	const handleModalKeyDown = ( event: KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Escape' && ! event.defaultPrevented && ! event.nativeEvent.isComposing ) {
			cancel();
		}
	};

	// The link goes away once nothing is unread, which would drop its focus.
	useEffect( () => {
		if ( ! refocusRef.current || isBusy ) {
			return;
		}
		refocusRef.current = false;
		const { activeElement, body } = document;
		if ( count === 0 && ( ! activeElement || activeElement === body ) ) {
			onFocusLost?.();
		}
	}, [ count, isBusy, onFocusLost ] );

	const label = hasMore
		? sprintf(
				/* translators: %d is a number of notifications. The plus sign means "or more". */
				__( 'Mark <strong>%d+</strong> as read' ),
				count
			)
		: sprintf(
				/* translators: %d is the number of unread notifications. */
				_n( 'Mark <strong>%d</strong> as read', 'Mark <strong>%d</strong> as read', count ),
				count
			);

	const question = hasMore
		? sprintf(
				/* translators: %d is a number of notifications. The plus sign means "or more". */
				__( 'Mark all %d+ notifications as read?' ),
				count
			)
		: sprintf(
				/* translators: %d is the number of unread notifications, always more than 20. */
				_n( 'Mark all %d notifications as read?', 'Mark all %d notifications as read?', count ),
				count
			);

	return (
		<div ref={ wrapperRef } className="wpnc-app__mark-all-read">
			{ count > 0 && (
				<Button
					__next40pxDefaultSize
					variant="link"
					disabled={ isBusy }
					accessibleWhenDisabled
					onClick={ handleClick }
				>
					<span>{ createInterpolateElement( label, { strong: <strong /> } ) }</span>
				</Button>
			) }
			{ /* Laid out like the Dashboard's site delete modal (client/dashboard/sites/site-delete-modal);
			   the HStack matches its ButtonStack, which this app can't import, and wraps where longer
			   labels don't fit side by side. The modal returns the focus to the link as it closes. */ }
			{ isConfirming && (
				<Modal
					title={ question }
					size="medium"
					onRequestClose={ handleCancel }
					onKeyDown={ handleModalKeyDown }
				>
					<VStack spacing={ 4 }>
						<Text as="p">
							{ __(
								'They’ll be cleared from everywhere you see notifications. This can’t be undone.'
							) }
						</Text>
						<HStack justify="flex-end" spacing={ 3 } wrap>
							<Button __next40pxDefaultSize variant="tertiary" onClick={ handleCancel }>
								{ __( 'Cancel' ) }
							</Button>
							<Button __next40pxDefaultSize variant="primary" onClick={ handleConfirm }>
								{ __( 'Mark all as read' ) }
							</Button>
						</HStack>
					</VStack>
				</Modal>
			) }
			<Notice.List>
				{ hasError && (
					<Notice.Root
						className="wpnc-app__mark-all-read-error"
						intent="error"
						politeness="assertive"
					>
						<Notice.Description>
							{ __( 'Couldn’t mark your notifications as read. Try again.' ) }
						</Notice.Description>
						<Notice.CloseIconButton onClick={ () => setHasError( false ) } />
					</Notice.Root>
				) }
			</Notice.List>
		</div>
	);
}
