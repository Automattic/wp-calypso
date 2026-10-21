import type { SocialPost } from '../types';

/**
 * Build a stable, unique React key for a post in a social feed list.
 *
 * The same post can appear multiple times in a single timeline when several
 * accounts have reposted/boosted it. Keying solely on `post.uri` would
 * collide and trigger React's "Encountered two children with the same key"
 * warning, so we compose the reposter identity into the key when present.
 */
export function socialPostFeedItemKey( post: SocialPost ): string {
	if ( post.reason?.type === 'repost' ) {
		const reposter = post.reason.by.id ?? post.reason.by.handle;
		return `repost:${ reposter }:${ post.uri }`;
	}
	return post.uri;
}
