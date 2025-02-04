const EventEmitter = require( 'events' ).EventEmitter;
const url = require( 'url' );
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
	const fallbackUrl = note.url ? note.url : null;

	const isApproved = getApprovedStatus( note );

	let navigate = null;

	switch ( type ) {
		case 'automattcher':
		case 'post':
			navigate = `/reader/blogs/${ siteId }/posts/${ postId }`;
			break;
		case 'comment':
			{
				// If the note is approved, construct the URL to navigate to.
				if ( isApproved ) {
					navigate = `/reader/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }`;
				}
			}
			break;
		case 'comment_like':
			navigate = `/reader/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }`;
			break;
		case 'site':
			navigate = `/reader/blogs/${ siteId }`;
			break;
		default:
			navigate = null;
	}

	if ( ! navigate ) {
		navigate = fallbackUrl;
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
	// TODO: Ideally we should augment the note data from the API with
	// the site's human-readable name. Using the note's URL for now.
	return '' || ( note.url ? url.parse( note.url ).host : note.title );
}

function getApprovedStatus( note ) {
	if ( ! note.body || ! Array.isArray( note.body ) ) {
		return false;
	}

	if ( note.body.length < 1 ) {
		return false;
	}

	// Unfortunately it appears that the exact location within the note body array
	// containing action attributes may not be consistent between note types (and
	// has in fact changed since this code was originally written).
	//
	// Inspect all elements in the body array to be safe.
	let actions = null;
	for ( let i = 0; i < note.body.length; i++ ) {
		actions = note.body[ i ].actions;
		if ( actions ) {
			break;
		}
	}

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
