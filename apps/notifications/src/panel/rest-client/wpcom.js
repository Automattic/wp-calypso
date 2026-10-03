let wpcomInstance;

export const wpcom = () => wpcomInstance;

export const init = ( provider ) => ( wpcomInstance = provider );

let includePostDetails = false;

/**
 * The endpoint only sends post and parent-comment details on request, since they cost
 * extra lookups. Only the simplified note reads them.
 */
export const setIncludePostDetails = ( value ) => ( includePostDetails = value );

// Hash polls only compare ids, so they never ask for the details.
const withPostDetails = ( query ) =>
	includePostDetails && query?.fields !== 'id,note_hash'
		? { ...query, include: 'post_details' }
		: query;

export const fetchNote = ( noteId, query, callback ) =>
	wpcom().req.get(
		{
			path: `/notifications/${ noteId }`,
			apiVersion: '1.1',
		},
		withPostDetails( query ),
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
		withPostDetails( query ),
		callback
	);

export const markReadStatus = ( noteId, isRead, callback ) =>
	wpcom().req.post(
		{
			path: '/notifications/read',
		},
		null,
		{
			counts: {
				[ noteId ]: isRead ? 9999 : -1,
			},
		},
		callback
	);

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
