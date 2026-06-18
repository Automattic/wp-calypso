import debugFactory from 'debug';
import repliesCache from '../comment-replies-cache';
import { store } from '../state';
import actions from '../state/actions';
import getAllNotes from '../state/selectors/get-all-notes';
import getUnreadNoteIds from '../state/selectors/get-unread-note-ids';
import { fetchNote, listNotes, sendLastSeenTime, subscribeToNoteStream } from './wpcom';

const debug = debugFactory( 'notifications:rest-client' );

const settings = {
	max_refresh_ms: 180000,
	refresh_ms: 30000,
	initial_limit: 10,
	// Network page size for load-more. May be smaller than the note list's render
	// window (NOTES_PER_PAGE); the list fetches as many pages as needed to fill
	// the window, so the window never outruns the loaded notes.
	increment_limit: 10,
	max_limit: 100,
};

export function Client() {
	this.noteList = [];
	this.gettingNotes = false;
	this.timeout = false;
	this.isVisible = false;
	this.isShowing = false;
	this.lastSeenTime = 0;
	this.noteRequestLimit = settings.initial_limit;
	// Latches once the server has no older notes left, so load-more stops paging.
	this.allNotesLoaded = false;
	// Active tab's server-side filter (e.g. `{ unread: 1 }`), or null for the
	// unfiltered "all" list. When set, getFilteredNotes fetches matching notes.
	this.filter = null;
	this.filteredRequestLimit = settings.initial_limit;
	this.filteredHasMore = false;
	this.gettingFilteredNotes = false;
	// Bumped on every setFilter so an in-flight fetch whose filter was reset
	// (tab switched away and back) can discard its now-stale response.
	this.filterGeneration = 0;
	this.retries = 0;
	this.subscribeTry = 0;
	this.subscribeTries = 3;
	this.subscribing = false;
	this.subscribed = false;
	this.firstRender = true;
	this.locale = null;
	this.inbox = [];

	window.addEventListener( 'storage', handleStorageEvent.bind( this ) );

	this.main( this );
}

function main() {
	// subscribe if possible
	if ( ! this.subscribed && ! this.subscribing ) {
		if ( this.subscribeTry < this.subscribeTries ) {
			debug( 'main: trying to subscribe' );
			this.subscribing = true;
			subscribeToNoteStream( pinghubCallback.bind( this ) );
		} else if ( this.subscribeTry === this.subscribeTries ) {
			const sub_retry_ms = 120000;
			debug( 'main: polling until next subscribe attempt', 'sub_retry_ms =', sub_retry_ms );
			setTimeout( () => {
				this.subscribeTry = 0;
			}, sub_retry_ms );
		}
		this.subscribeTry++;
	}

	// subscribers call main() when the subscription delivers a message
	const notes = getAllNotes( store.getState() );
	if ( notes.length && this.subscribed && ! this.inbox.length ) {
		return debug( 'main: subscribed, no new messages; sleeping' );
	}

	// schedule the next call to main()
	this.reschedule();

	// nobody's looking. take a nap until they return.
	if ( ! this.isVisible ) {
		return debug( 'main: not visible. sleeping.' );
	}

	if ( this.inbox.length === 1 && this.inbox[ 0 ].action && this.inbox[ 0 ].action === 'push' ) {
		const note_id = this.inbox[ 0 ].note_id;
		debug( 'main: have one push message with note_id, calling getNote(%d)', note_id, this.inbox );
		this.inbox = [];
		this.getNote( note_id );
	} else if ( this.inbox.length ) {
		debug( 'main: have messages, calling getNotes', this.inbox );
		this.inbox = [];
		this.getNotes();
	} else if ( ! notes.length ) {
		debug( 'main: no notes in local cache, calling getNotes' );
		this.getNotes();
	} else {
		debug( 'main: polling, have notes in local cache, calling getNotesList' );
		this.getNotesList();
	}
}

function reschedule( refresh_ms ) {
	if ( ! refresh_ms ) {
		refresh_ms = settings.refresh_ms;
	}
	if ( this.timeout ) {
		clearTimeout( this.timeout );
		this.timeout = false;
	}
	if ( this.subscribed ) {
		debug( 'reschedule', 'subscribed; not polling' );
	} else {
		debug( 'reschedule', 'refresh_ms =', refresh_ms );
		this.timeout = setTimeout( main.bind( this ), refresh_ms );
	}
}

function pinghubCallback( err, event ) {
	const responseType = event?.response?.type;

	this.subscribing = false;

	// WebSocket error: costs one try
	if ( err || ! responseType || responseType === 'error' ) {
		debug( 'pinghubCallback: error', 'err =', err );
		this.subscribed = false;
	} else if ( responseType === 'open' ) {
		// WebSocket connected: stop polling
		debug( 'pinghubCallback: connected', event.response );
		this.subscribeTry = 0;
		this.subscribed = true;
	} else if ( responseType === 'close' ) {
		// WebSocket disconnected: have another try
		debug( 'pinghubCallback: disconnected', event.response );
		this.subscribeTry = 0;
		this.subscribed = false;
	} else if ( responseType === 'message' ) {
		// WebSocket message: add to inbox, call main() to trigger API call
		let message = true;
		try {
			message = JSON.parse( event?.response?.data );
		} catch ( e ) {}
		this.inbox.push( message );
		debug( 'pinghubCallback: received message', event.response, 'this.inbox =', this.inbox );
		this.main();
	} else {
		// Missed case?
		debug( 'pinghubCallback: unknown event.response.type', event.response );
		throw new Error(
			'notifications:rest-client:pinghubCallback unknown event.response.type: ' + responseType
		);
	}

	this.reschedule();
}

function getNote( note_id ) {
	// initialize the list if it's empty
	if ( this.noteList.length === 0 ) {
		this.getNotes();
	}

	const parameters = {
		fields: 'id,type,unread,body,subject,timestamp,meta,note_hash,variant',
	};

	fetchNote( note_id, parameters, ( error, data ) => {
		if ( error ) {
			return;
		}
		store.dispatch( actions.notes.addNotes( data.notes ) );
		ready.call( this );
	} );
}

/**
 * Fetch notes from the server.
 *
 * Without `before` this refreshes the top window and treats the response as
 * authoritative, pruning notes the server no longer returns. With `before`
 * (UNIX epoch seconds) it pages older notes in additively for load-more and
 * never prunes, since an older slice isn't a superset of what's loaded.
 */
function getNotes( before ) {
	if ( this.gettingNotes ) {
		return;
	}
	this.gettingNotes = true;

	const notes = getAllNotes( store.getState() );
	// Cap older pages by this view's own loaded count (`noteList`), matching
	// hasMoreNotes — a filtered fetch can inflate the shared store, which would
	// otherwise shrink the request to zero while the view still has a gap.
	const loaded = this.noteList.length || notes.length;

	const parameters = {
		fields: 'id,type,unread,body,subject,timestamp,meta,note_hash,variant',
		// Older pages only request what's left under max_limit, so an additive
		// page can't push the loaded count past the cap.
		number: before
			? Math.min( settings.increment_limit, settings.max_limit - loaded )
			: this.noteRequestLimit,
		locale: this.locale,
	};
	if ( before ) {
		parameters.before = before;
	}

	if ( ! notes.length || this.noteRequestLimit > notes.length ) {
		store.dispatch( actions.ui.loadNotes() );
	}

	listNotes( parameters, ( error, data ) => {
		this.gettingNotes = false;

		if ( error ) {
			// Load-more: clear the spinner, leave state untouched; scrolling retries.
			if ( before ) {
				store.dispatch( actions.ui.loadedNotes() );
				return;
			}
			/*
			 * Something failed, so try again and reset the local noteList copy.
			 * We might have optimistically modified it when we last compared it
			 * to the server, but there's been a failure here so resetting it
			 * will force a full refresh.
			 */
			this.retries = this.retries + 1;
			const backoff_ms = Math.min(
				settings.refresh_ms * ( this.retries + 1 ),
				settings.max_refresh_ms
			);
			debug( 'getNotes error, using backoff_ms=%d', backoff_ms );
			this.noteList = [];
			this.reschedule( backoff_ms );
			return;
		}

		store.dispatch( actions.ui.loadedNotes() );

		// Short page (fewer than requested) means the server has nothing more.
		if ( data.notes.length < parameters.number ) {
			this.allNotesLoaded = true;
		}

		if ( before ) {
			// Stop when an older page adds nothing new (an inclusive `before` can
			// echo back just the anchor). Compare against the view's own window so
			// a note already cached by a filtered fetch still counts as new.
			const viewNotes = this.noteList.length ? this.noteList : getAllNotes( store.getState() );
			const knownIds = new Set( viewNotes.map( ( n ) => n.id ) );
			if ( ! data.notes.some( ( n ) => ! knownIds.has( n.id ) ) ) {
				this.allNotesLoaded = true;
			}
		} else {
			// Authoritative top window: prune notes the server dropped. A prune
			// means newer notes pushed older ones below the window, so let
			// load-more re-fetch them. The additive `before` path never prunes.
			const oldIds = getAllNotes( store.getState() ).map( ( { id } ) => id );
			const newIds = data.notes.map( ( n ) => n.id );
			const notesToRemove = oldIds.filter( ( id ) => ! newIds.includes( id ) );
			// Skip pruning while a server-side filter is active: the filtered fetch
			// loads notes outside this top window, and pruning would remove them
			// from under the filtered view. Pruning resumes on the unfiltered tab.
			if ( notesToRemove.length && ! this.filter ) {
				this.allNotesLoaded = false;
				store.dispatch( actions.notes.removeNotes( notesToRemove ) );
			}
		}

		// The lightweight id/hash list the polling diff compares against: a fresh
		// top window replaces it; an older page appends to it.
		const pageList = data.notes.map( ( { id, note_hash } ) => ( { id, note_hash } ) );
		this.noteList = before ? this.noteList.concat( pageList ) : pageList;

		store.dispatch( actions.notes.addNotes( data.notes ) );
		this.updateLastSeenTime( Number( data.last_seen_time ) );

		if ( parameters.number === settings.max_limit ) {
			/*
			 * Since we store note data in a local cache, we want to purge the
			 * data if the notes no longer exist, but only once we've loaded all
			 * the notes, otherwise we might expunge legitimate entries that
			 * simply haven't been loaded yet.
			 */
			cleanupLocalCache.call( this );
		}
		this.retries = 0;
		ready.call( this );

		// New notes arriving via polling/push land in the shared store but not in
		// the active filter's id list. Refresh that list so a filtered view (e.g.
		// Unread) reflects new arrivals live instead of only on re-entry.
		if ( this.filter ) {
			this.getFilteredNotes();
		}
	} );
}

function getNotesList() {
	const notes = getAllNotes( store.getState() );
	// make sure we have some notes before we run this
	if ( ! notes.length ) {
		return;
	}

	if ( this.gettingNotes ) {
		return;
	}
	this.gettingNotes = true;

	const parameters = {
		fields: 'id,note_hash',
		number: this.noteRequestLimit,
	};

	listNotes( parameters, ( error, data ) => {
		debug( 'getNotesList callback:', error, data );
		this.gettingNotes = false;
		if ( error ) {
			this.retries = this.retries + 1;
			const backoff_ms = Math.min(
				settings.refresh_ms * ( this.retries + 1 ),
				settings.max_refresh_ms
			);
			debug( 'getNotesList error, using backoff_ms=%d', backoff_ms );
			return this.reschedule( backoff_ms );
		}

		this.retries = 0;

		/* Compare list of notes from server to local copy */
		const [ localIds, localHashes ] = [
			this.noteList.map( ( note ) => note.id ),
			this.noteList.map( ( note ) => note.note_hash ),
		];
		const [ serverIds, serverHashes ] = [
			data.notes.map( ( note ) => note.id ),
			data.notes.map( ( note ) => note.note_hash ),
		];
		const serverHasChanges =
			serverIds.some( ( sId ) => ! localIds.includes( sId ) ) ||
			serverHashes.some( ( sHash ) => ! localHashes.includes( sHash ) );

		/* Actually remove the notes from the local copy */
		const notesToRemove = localIds.filter( ( local ) => ! serverIds.includes( local ) );

		// Don't prune while a filter is active: the filtered view shares this cache,
		// and a note that fell out of the unfiltered window could be dropped from it
		// (mirrors getNotes()). The shifted window otherwise means load-more should
		// re-page these, so clear allNotesLoaded.
		if ( notesToRemove.length && ! this.filter ) {
			this.allNotesLoaded = false;
			store.dispatch( actions.notes.removeNotes( notesToRemove ) );
		}

		/* Update our local copy of the note list */
		this.noteList = data.notes;
		this.updateLastSeenTime( Number( data.last_seen_time ) );

		// Clean out stored reply texts that are older than a day
		repliesCache.cleanup();

		/* Grab updates/changes from server if they exist */
		return serverHasChanges ? this.getNotes() : ready.call( this );
	} );
}

/**
 * Set the active server-side filter for the visible tab and (re)fetch.
 *
 * Pass `null` for the unfiltered "all" tab, or a query fragment such as
 * `{ unread: 1 }` for a filtered tab. Switching tabs resets the filtered
 * pagination window and, for a filtered tab, kicks off a fresh fetch so the
 * list reflects the server's filtered results immediately.
 * @param {?Object} filter Query fragment to send to the notes endpoint, or null.
 */
function setFilter( filter ) {
	this.filter = filter ?? null;
	this.filteredRequestLimit = settings.initial_limit;
	this.filteredHasMore = false;
	this.filterGeneration++;

	// Reset the filtered view's id list so the tab doesn't show a stale set
	// before the fresh fetch lands.
	store.dispatch( actions.notes.setUnreadNoteIds( [] ) );

	if ( this.filter && this.isVisible ) {
		this.getFilteredNotes();
	}
}

/**
 * Fetch notes matching the active filter from the server.
 *
 * Content is added to the shared `allNotes` store (never removed here); the
 * server's answer for which notes belong to the view is kept as an ordered id
 * list (`unreadNoteIds`) that the Unread tab renders looked up in the store.
 */
function getFilteredNotes( before ) {
	if ( ! this.filter || this.gettingFilteredNotes ) {
		return;
	}
	this.gettingFilteredNotes = true;
	const generation = this.filterGeneration;

	const unreadIds = getUnreadNoteIds( store.getState() );

	const parameters = {
		fields: 'id,type,unread,body,subject,timestamp,meta,note_hash,variant',
		// No `before`: re-request the authoritative top window. With it: page an
		// older slice, capped to what's left under max_limit.
		number: before
			? Math.min( settings.increment_limit, settings.max_limit - unreadIds.length )
			: this.filteredRequestLimit,
		locale: this.locale,
		...this.filter,
	};
	if ( before ) {
		parameters.before = before;
	}

	// Only show the full-panel spinner for the first page; later pages stream in.
	if ( ! before && this.filteredRequestLimit === settings.initial_limit ) {
		store.dispatch( actions.ui.loadNotes() );
	}

	listNotes( parameters, ( error, data ) => {
		this.gettingFilteredNotes = false;
		store.dispatch( actions.ui.loadedNotes() );

		if ( error ) {
			// Leave the polling path's state untouched; it will recover on its
			// own schedule. A retry happens when the user re-enters the tab.
			return;
		}

		// The filter was reset (tab switched away and back) while this was in
		// flight: drop the stale response and refetch the current view, since
		// setFilter's own fetch was skipped while this request held the lock.
		if ( generation !== this.filterGeneration ) {
			if ( this.filter && this.isVisible ) {
				this.getFilteredNotes();
			}
			return;
		}

		store.dispatch( actions.notes.addNotes( data.notes ) );

		// Guard on the filter so a response landing after a tab switch is ignored,
		// and so only `unread` writes the unread list.
		if ( this.filter?.unread ) {
			const pageIds = data.notes.map( ( note ) => note.id );
			if ( before ) {
				// Append the older page to the view's id list, de-duped — a filtered
				// fetch can return notes an earlier page already loaded.
				const current = getUnreadNoteIds( store.getState() );
				const known = new Set( current );
				const fresh = pageIds.filter( ( id ) => ! known.has( id ) );
				const appended = current.concat( fresh );
				store.dispatch( actions.notes.setUnreadNoteIds( appended ) );

				// More only while the page is full, adds new ids (an inclusive
				// `before` can echo the anchor), and the list is under the cap.
				this.filteredHasMore =
					fresh.length > 0 &&
					data.notes.length >= parameters.number &&
					appended.length < settings.max_limit;
			} else {
				// The top window is authoritative, so replace the id list — notes the
				// server no longer returns (read/deleted elsewhere) drop from the view.
				store.dispatch( actions.notes.setUnreadNoteIds( pageIds ) );

				// A full page back implies the server may have more matching notes.
				this.filteredHasMore =
					data.notes.length >= parameters.number && this.filteredRequestLimit < settings.max_limit;
			}
		}
	} );
}

/**
 * Reports new notification data if available
 *
 * New notification data is available _if_ we
 * have a note with a timestamp newer than we
 * did the last time we called this function.
 */
function ready() {
	const notes = getAllNotes( store.getState() );

	let newNotes = notes.filter(
		( note ) => Date.parse( note.timestamp ) / 1000 > this.lastSeenTime
	);

	let newNoteCount = newNotes.length;

	if ( ! this.firstRender && this.lastSeenTime === 0 ) {
		newNoteCount = 0;
		newNotes = [];
	}

	const latestType = notes.slice( -1 )[ 0 ]?.type ?? null;
	store.dispatch( { type: 'APP_RENDER_NOTES', newNoteCount, latestType } );

	this.firstRender = false;
}

/** @type {RegExp} matches keys which may no longer need to exist */
const obsoleteKeyPattern = /^(note_read_status|reply)_(\d+)/;

const safelyRemoveKey = ( key ) => {
	try {
		localStorage.removeItem( key );
	} catch ( e ) {}
};

function cleanupLocalCache() {
	const notes = getAllNotes( store.getState() );
	const currentNoteIds = notes.map( ( n ) => n.id );

	Object.keys( localStorage )
		.map( ( key ) => obsoleteKeyPattern.exec( key ) )
		.filter( ( match ) => match && ! currentNoteIds.includes( match[ 1 ] ) )
		.forEach( safelyRemoveKey );
}

/**
 * Update lastSeenTime in object instance, localStorage, and remote database.
 * Advance this.lastSeenTime to proposedTime or the latest visible note time.
 * If the timestamp comes from a note, update the remote database.
 * @param {number} proposedTime A proposed update to our lastSeenTime timestamp
 * @param {boolean} fromStorage Whether this call is from handleStorageEvent
 * @returns {boolean} whether or not we will update our lastSeenTime value
 */
function updateLastSeenTime( proposedTime, fromStorage ) {
	let fromNote = false;
	let mostRecentNoteTime = 0;

	// Make sure we aren't getting milliseconds
	// The check time is Aug 8, 2005 in ms
	if ( proposedTime > 1123473600000 ) {
		proposedTime = proposedTime / 1000;
	}

	debug( 'updateLastSeenTime 0', {
		proposedTime: proposedTime,
		fromStorage: fromStorage,
		lastSeenTime: this.lastSeenTime,
	} );

	// Event was triggered by another tab's localStorage.setItem; ignore localStorage and remote.
	if ( fromStorage ) {
		if ( proposedTime <= this.lastSeenTime ) {
			return false;
		}
		this.lastSeenTime = proposedTime;
		return true;
	}

	const notes = getAllNotes( store.getState() );
	if ( notes.length ) {
		mostRecentNoteTime = Date.parse( notes[ 0 ].timestamp ) / 1000;
	}

	debug( 'updateLastSeenTime 1', {
		proposedTime: proposedTime,
		showing: this.isShowing,
		visible: this.isVisible,
		lastSeenTime: this.lastSeenTime,
		mostRecentNoteTime: mostRecentNoteTime,
	} );

	// Advance proposedTime to the latest visible note time.
	if ( this.isShowing && this.isVisible && mostRecentNoteTime > proposedTime ) {
		proposedTime = mostRecentNoteTime;
		fromNote = true;
	}

	debug( 'updateLastSeenTime 2', {
		proposedTime: proposedTime,
		fromNote: fromNote,
		oldNews: proposedTime <= this.lastSeenTime,
	} );

	// Ignore old news.
	if ( proposedTime <= this.lastSeenTime ) {
		return false;
	}

	this.lastSeenTime = proposedTime;

	try {
		localStorage.setItem( 'notesLastMarkedSeen', this.lastSeenTime );
	} catch ( e ) {}

	// Update the database only if an unseen note has become visible.
	if ( fromNote ) {
		debug( 'updateLastSeenTime 3', this.lastSeenTime );
		sendLastSeenTime( this.lastSeenTime );
	}

	return true;
}

function refreshNotes() {
	if ( this.subscribed ) {
		return;
	}
	debug( 'Refreshing notes...' );

	getNotesList.call( this );
}

function handleStorageEvent( event ) {
	// Both event and its key property should exist.
	if ( ! event?.key ) {
		return;
	}

	if ( event.key === 'notesLastMarkedSeen' ) {
		try {
			const lastSeenTime = Number( event.newValue );
			if ( updateLastSeenTime.call( this, lastSeenTime, true ) ) {
				store.dispatch( {
					type: 'APP_RENDER_NOTES',
					newNoteCount: 0,
				} );
			}
		} catch ( e ) {}
		return;
	}

	if ( 'note_read_status_' === event.key.substring( 0, 17 ) ) {
		const noteId = parseInt( event.key.slice( 17 ), 10 );

		return store.dispatch( actions.notes.readNote( noteId ) );
	}
}

function loadMore() {
	// Filtered tabs paginate their own window, advancing only while the server
	// still has matching notes.
	if ( this.filter ) {
		if ( this.gettingFilteredNotes || ! this.filteredHasMore ) {
			return;
		}
		// Grow the refresh window so the poll keeps covering paged-in notes.
		this.filteredRequestLimit = Math.min(
			this.filteredRequestLimit + settings.increment_limit,
			settings.max_limit
		);
		// Page older notes additively, anchored on the view's oldest. `before` is
		// epoch seconds, not the ISO timestamp.
		const unreadIds = getUnreadNoteIds( store.getState() );
		const oldestId = unreadIds[ unreadIds.length - 1 ];
		const oldest = oldestId && getAllNotes( store.getState() ).find( ( n ) => n.id === oldestId );
		if ( ! oldest ) {
			return;
		}
		this.getFilteredNotes( Math.floor( Date.parse( oldest.timestamp ) / 1000 ) );
		return;
	}

	if ( this.gettingNotes || ! this.hasMoreNotes() ) {
		return;
	}

	// Anchor on the view's own window (`noteList`), not the shared store: a
	// filtered fetch seeds the store with older notes, so pacing `before` off it
	// could skip notes this view hasn't loaded. Fall back to the store only first.
	const allNotes = getAllNotes( store.getState() );
	const oldestId = this.noteList.length
		? this.noteList[ this.noteList.length - 1 ].id
		: allNotes[ allNotes.length - 1 ]?.id;
	const oldest = allNotes.find( ( note ) => note.id === oldestId );
	if ( ! oldest ) {
		return;
	}

	// Grow the polling window so getNotes()/getNotesList() keep covering every
	// note we've paged in; their diff treats the response as the full set, so a
	// shorter window would prune the older notes back out.
	this.noteRequestLimit = Math.min(
		this.noteRequestLimit + settings.increment_limit,
		settings.max_limit
	);

	// The endpoint's `before` cursor is UNIX epoch seconds, not the note's ISO
	// timestamp; a raw string is ignored and load-more would refetch page one.
	this.getNotes( Math.floor( Date.parse( oldest.timestamp ) / 1000 ) );
}

// Whether the server may still have notes older than those already loaded.
// `allNotesLoaded` latches once a short page proves the server is exhausted;
// until then there may be more, capped at max_limit. The note list uses this to
// keep its optimistic `totalItems` ahead of the scroll window so DataViews
// keeps advancing it.
function hasMoreNotes() {
	if ( this.filter ) {
		return this.filteredHasMore;
	}
	// Measure this view's own window (`noteList`), not the shared store, which a
	// filtered fetch can inflate to the cap with notes outside this window.
	const loaded = this.noteList.length || getAllNotes( store.getState() ).length;
	return ! this.allNotesLoaded && loaded < settings.max_limit;
}

function setVisibility( { isShowing, isVisible } ) {
	if ( this.isShowing === isShowing && this.isVisible === isVisible ) {
		return;
	}

	this.isShowing = isShowing;
	this.isVisible = isVisible;

	debug( 'Visibility set', {
		isShowing: this.isShowing,
		isVisible: this.isVisible,
	} );

	// Fetch notification when visible for the first time or visible and showing
	if ( isVisible && ( ! this.lastSeenTime || isShowing ) ) {
		this.updateLastSeenTime( 0 );
		this.main();
	}
}

Client.prototype.main = main;
Client.prototype.reschedule = reschedule;
Client.prototype.getNote = getNote;
Client.prototype.getNotes = getNotes;
Client.prototype.getNotesList = getNotesList;
Client.prototype.getFilteredNotes = getFilteredNotes;
Client.prototype.setFilter = setFilter;
Client.prototype.updateLastSeenTime = updateLastSeenTime;
Client.prototype.loadMore = loadMore;
Client.prototype.hasMoreNotes = hasMoreNotes;
Client.prototype.refreshNotes = refreshNotes;
Client.prototype.setVisibility = setVisibility;

export default Client;
