let wpcomInstance;

// Read-status requests waiting on the server, per note. The first entry is in flight.
const readStatusQueues = new Map();

export const wpcom = () => wpcomInstance;

export const init = ( provider ) => {
	readStatusQueues.clear();
	return ( wpcomInstance = provider );
};

export const fetchNote = ( noteId, query, callback ) =>
	wpcom().req.get(
		{
			path: `/notifications/${ noteId }`,
			apiVersion: '1.1',
		},
		query,
		callback
	);

export const fetchSuggestions = ( query, callback ) =>
	wpcom().req.get(
		{
			path: '/users/suggest',
			apiVersion: '1',
		},
		query,
		callback
	);

export const listNotes = ( query, callback ) =>
	wpcom().req.get(
		{
			path: '/notifications/',
			apiVersion: '1.1',
		},
		query,
		callback
	);

const sendNextReadStatus = ( key ) => {
	const queue = readStatusQueues.get( key );
	const { isRead, callback } = queue[ 0 ];

	wpcom().req.post(
		{
			path: '/notifications/read',
		},
		null,
		{
			counts: {
				[ key ]: isRead ? 9999 : -1,
			},
		},
		( error, data ) => {
			try {
				callback?.( error, data );
			} finally {
				// init() drops the queues, so only advance one that is still current.
				if ( readStatusQueues.get( key ) === queue ) {
					queue.shift();
					if ( queue.length ) {
						sendNextReadStatus( key );
					} else {
						readStatusQueues.delete( key );
					}
				}
			}
		}
	);
};

/**
 * Mark a note as read or unread on the server.
 *
 * Requests for the same note are sent one at a time, in the order they were
 * made, so the last change is the one the server ends up with.
 */
export const markReadStatus = ( noteId, isRead, callback ) => {
	const key = String( noteId );
	const queue = readStatusQueues.get( key );
	if ( queue ) {
		queue.push( { isRead, callback } );
		return;
	}

	readStatusQueues.set( key, [ { isRead, callback } ] );
	sendNextReadStatus( key );
};

export const isReadStatusPending = ( noteId ) => readStatusQueues.has( String( noteId ) );

/**
 * Mark post as seen using the new more granular per post API.
 * @param blogId blog identifier
 * @param postId post identifier
 */
export const markPostAsSeen = ( blogId, postId ) =>
	wpcom().req.post(
		{
			path: '/seen-posts/seen/blog/new',
			apiNamespace: 'wpcom/v2',
		},
		null,
		{
			blog_id: blogId,
			post_ids: [ postId ],
			source: 'notification-web',
		}
	);

export const sendLastSeenTime = ( time ) =>
	wpcom().req.post(
		{
			path: '/notifications/seen',
		},
		null,
		{ time }
	);

export const subscribeToNoteStream = ( callback ) =>
	wpcom().pinghub.connect( '/wpcom/me/newest-note-data', callback );
