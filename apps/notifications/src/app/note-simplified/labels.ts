import { __, _n, sprintf } from '@wordpress/i18n';
import type { Note } from '../types';

const STAR_NOTICON = '\uf408';
const REBLOG_NOTICON = '\uf805';

/**
 * Sets a title the server sends in title case, like "New Post" or "On This Day", in the
 * panel's sentence case. Only English titles are changed, since other languages have
 * their own rules, and words with capitals inside them, like "WordPress", are kept.
 */
export const toSentenceCase = ( title: string, locale: string ) => {
	if ( ! locale.startsWith( 'en' ) || ! /^[A-Z][a-z]*( [A-Z][a-z]*)+$/.test( title ) ) {
		return title;
	}

	const [ first, ...rest ] = title.split( ' ' );
	return [ first, ...rest.map( ( word ) => word.toLowerCase() ) ].join( ' ' );
};

export const getTemporaryNoteTitle = ( note: Note ) => {
	switch ( note.type ) {
		case 'like':
		case 'comment_like': {
			const count = note.meta?.actor_count;
			if ( ! count ) {
				return __( 'Likes' );
			}
			if ( 'comment_like' === note.type ) {
				return sprintf(
					/* translators: %d is the number of people who liked the comment. */
					_n( '%d like on your comment', '%d likes on your comment', count ),
					count
				);
			}
			return sprintf(
				/* translators: %d is the number of people who liked the post. */
				_n( '%d like on your post', '%d likes on your post', count ),
				count
			);
		}
		case 'follow': {
			const count = note.meta?.actor_count;
			return count
				? sprintf(
						/* translators: %d is the number of people who subscribed to the site. */
						_n( '%d person subscribed', '%d people subscribed', count ),
						count
					)
				: __( 'Subscribers' );
		}
		case 'activitypub_followed_note':
			return __( 'Followers' );
		case 'activitypub_interaction_note':
			if ( note.noticon === STAR_NOTICON ) {
				return __( 'Likes' );
			}
			if ( note.noticon === REBLOG_NOTICON ) {
				return __( 'Reposts' );
			}
			return note.title;
		default:
			return note.title;
	}
};
