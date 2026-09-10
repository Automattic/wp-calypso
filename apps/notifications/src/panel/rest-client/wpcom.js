let wpcomInstance;

export const wpcom = () => wpcomInstance;

export const init = ( provider ) => ( wpcomInstance = provider );

export const fetchNote = ( noteId, query, callback ) =>
	wpcom().req.get(
		{
			path: `/notifications/${ noteId }`,
			apiVersion: '1.1',
		},
		query,
		callback
	);

export const fetchNotificationPreferences = () =>
	wpcom()
		.req.get( {
			path: '/me/preferences',
			apiVersion: '1.1',
		} )
		.then( ( { calypso_preferences: preferences } ) => ( {
			layoutStyle: preferences?.[ 'notifications-layout-style' ],
			views: preferences?.[ 'notifications-views' ],
		} ) );

export const updateNotificationViews = ( views ) =>
	wpcom().req.post(
		{
			path: '/me/preferences',
			apiVersion: '1.1',
		},
		null,
		{ calypso_preferences: { 'notifications-views': views } }
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
