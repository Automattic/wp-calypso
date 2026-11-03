import { __, _n, sprintf } from '@wordpress/i18n';
import type { Note } from '../types';

const REBLOG_NOTICON = '';

const isRepost = ( note: Note ) => note.noticon === REBLOG_NOTICON;

export const getTemporaryNoteTitle = ( note: Note ) => {
	switch ( note.type ) {
		case 'like':
		case 'comment_like':
			return __( 'Likes' );
		case 'follow':
			return __( 'Subscribers' );
		case 'activitypub_followed_note':
			return __( 'Followers' );
		case 'activitypub_interaction_note':
			return isRepost( note ) ? __( 'Reposts' ) : __( 'Likes' );
		default:
			return note.title;
	}
};

/**
 * Returns the count heading shown above a reaction note's list of people.
 */
export const getReactionsHeading = ( note: Note ) => {
	const heading = note.meta?.heading ?? note.title;
	const count = Number( heading?.match( /\d+/ )?.[ 0 ] );
	if ( ! count ) {
		return heading;
	}

	switch ( note.type ) {
		case 'activitypub_followed_note':
			/* translators: %d: number of people following the site from the fediverse */
			return sprintf( _n( '%d follower', '%d followers', count ), count );
		case 'activitypub_interaction_note':
			return isRepost( note )
				? /* translators: %d: number of people who reposted the post */
					sprintf( _n( '%d repost', '%d reposts', count ), count )
				: /* translators: %d: number of people who liked the post */
					sprintf( _n( '%d like', '%d likes', count ), count );
		default:
			return heading;
	}
};
