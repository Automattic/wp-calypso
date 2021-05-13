/*
 * External dependencies
 */
const url = require( 'url' );
const EventEmitter = require( 'events' ).EventEmitter;

/*
 * Internal dependencies
 */
const WPNotificationsAPI = require( '../../../lib/notifications/api' );

// Parses raw note data from the API into a notification for display,
// and exposes handlers for actions performed by the user.
class WPNotificationsViewModel extends EventEmitter {
	constructor() {
		super();

		WPNotificationsAPI.on( 'note', ( note ) => {
			const notification = parseNote( note );
			this.emit( 'notification', notification );
		} );
	}

	didClickNotification( noteId, callback ) {
		WPNotificationsAPI.markNoteAsRead( noteId, callback );
	}
}

function parseNote( note ) {
	const id = note.id;
	const title = getSiteTitle( note );
	const subtitle = note.subject.length > 1 ? note.subject[ 0 ].text : '';
	const body = note.subject.length > 1 ? note.subject[ 1 ].text : note.subject[ 0 ].text;

	const type = note.type;
	const siteId = note.meta.ids.site;
	const postId = note.meta.ids.post;
	const commentId = note.meta.ids.comment;

	const isApproved = getApprovedStatus( note );

	let navigate = null;

	switch ( type ) {
		case 'post':
			navigate = `/read/blogs/${ siteId }/posts/${ postId }`;
			break;
		case 'comment':
			{
				// If the note is approved, construct the URL to navigate to.
				if ( isApproved ) {
					navigate = `/read/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }`;
				}
			}
			break;
		case 'comment_like':
			navigate = `/read/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }`;
			break;
		case 'site':
			navigate = `/read/blogs/${ siteId }`;
			break;
		default:
			navigate = null;
	}

	return {
		id,
		body,
		type,
		title,
		subtitle,
		navigate,
	};
}

function getSiteTitle( note ) {
	// TODO: Cache and check site titles from Calypso
	return '' || ( note.url ? url.parse( note.url ).host : note.title );
}

function getApprovedStatus( note ) {
	if ( ! note.body || ! Array.isArray( note.body ) ) {
		return false;
	}

	if ( note.body.length < 1 ) {
		return false;
	}

	const actions = note.body[ 1 ].actions;
	if ( ! actions ) {
		return false;
	}

	const approveComment = actions[ 'approve-comment' ];
	if ( approveComment === undefined ) {
		return false;
	}

	return approveComment === true;
}

module.exports = new WPNotificationsViewModel();
