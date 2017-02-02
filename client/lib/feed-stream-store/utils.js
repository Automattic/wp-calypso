/**
 * Internal Dependencies
 */
import FeedPostStore from 'lib/feed-post-store';

export function isValidPostOrGap( postKey ) {
	if ( postKey.isGap === true ) {
		return true;
	}
	const post = FeedPostStore.get( postKey );
	return post && post._state !== 'error' && post._state !== 'pending' &&
		post._state !== 'minimal';
}
