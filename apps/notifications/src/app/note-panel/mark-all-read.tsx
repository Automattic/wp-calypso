import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Notice } from '@wordpress/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reportRequestError } from '../../panel/helpers/log-error';
import { listNotes } from '../../panel/rest-client/wpcom';
import { markAllRead } from '../../panel/state/notes/thunks';
import getAllNotes from '../../panel/state/selectors/get-all-notes';
import getIsNoteRead from '../../panel/state/selectors/get-is-note-read';
import { useAppContext } from '../context';
import type { Note } from '../types';
import type { UnknownAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

// The most notes the server lists in one request. An account with more unread notes than this
// is shown as having "this many or more".
export const UNREAD_IDS_LIMIT = 200;

/**
 * Counts the unread notes on the account, loaded or not.
 *
 * The server's list of unread notes is fetched again whenever a newer note arrives. Between
 * fetches, notes read or left unread on this device adjust the count.
 */
function useUnreadCount() {
	const [ unreadIds, setUnreadIds ] = useState< number[] >( [] );
	const requestRef = useRef( 0 );

	const newestNote = useSelector( ( state ) => ( getAllNotes( state ) as Note[] )[ 0 ] );
	const newestNoteKey = newestNote && `${ newestNote.id }:${ newestNote.timestamp }`;

	const refresh = useCallback( async () => {
		const request = ++requestRef.current;
		try {
			const { notes } = await listNotes( { unread: 1, fields: 'id', number: UNREAD_IDS_LIMIT } );
			if ( request === requestRef.current ) {
				setUnreadIds( notes.map( ( { id }: { id: number } ) => id ) );
			}
		} catch ( error ) {
			reportRequestError( 'load-unread-count', error );
		}
	}, [] );

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
		count: newestNote ? count : 0,
		hasMore: unreadIds.length >= UNREAD_IDS_LIMIT,
		refresh,
	};
}

type MarkAllAsReadProps = {
	/** Called when the link held the focus and went away because nothing is unread any more. */
	onFocusLost?: () => void;
};

/**
 * A "Mark N as read" link that marks every unread note on the account as read.
 */
export default function MarkAllAsRead( { onFocusLost }: MarkAllAsReadProps ) {
	const { client } = useAppContext();
	const dispatch = useDispatch< ThunkDispatch< unknown, unknown, UnknownAction > >();
	const { count, hasMore, refresh } = useUnreadCount();
	const [ isBusy, setIsBusy ] = useState( false );
	const [ hasError, setHasError ] = useState( false );
	const wrapperRef = useRef< HTMLDivElement >( null );
	const refocusRef = useRef( false );

	const handleClick = async () => {
		refocusRef.current = !! wrapperRef.current?.contains( document.activeElement );
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
