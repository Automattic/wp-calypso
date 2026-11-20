import { useCallback, useRef, useState } from 'react';
import { useFollowSite, useUnfollowSite } from 'calypso/reader/data/site-subscriptions';
import type { RecommendedBlog } from 'calypso/reader/onboarding-rsm/recommended-blogs';

export function useRecommendedBlogFollowActions( source?: string ) {
	const { mutateAsync: follow } = useFollowSite();
	const { mutateAsync: unfollow } = useUnfollowSite();
	const pending = useRef( new Set< number >() );
	const queue = useRef( Promise.resolve() );
	const [ pendingFeedIds, setPendingFeedIds ] = useState< ReadonlySet< number > >( new Set() );

	const onToggleFollow = useCallback(
		( blog: RecommendedBlog, isFollowing: boolean ) => {
			if ( pending.current.has( blog.feed_ID ) ) {
				return;
			}
			pending.current.add( blog.feed_ID );
			setPendingFeedIds( new Set( pending.current ) );

			// Queue before mutateAsync: each optimistic follow snapshots the whole
			// subscriptions cache, even when a TanStack mutation scope pauses its request.
			queue.current = queue.current
				.then( async () => {
					const params = { feedUrl: blog.feed_URL, source };
					await ( isFollowing ? unfollow( params ) : follow( params ) );
				} )
				.catch( () => undefined ) // The shared mutation hooks display the error notice.
				.finally( () => {
					pending.current.delete( blog.feed_ID );
					setPendingFeedIds( new Set( pending.current ) );
				} );
		},
		[ follow, unfollow, source ]
	);

	return { pendingFeedIds, onToggleFollow };
}
