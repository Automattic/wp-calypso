import { readRelatedPostsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ComponentType, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import type { ReadRelatedPostsScope } from '@automattic/api-core';

export interface WithReaderRelatedPostsOwnProps {
	siteId: number;
	postId: number;
}

export interface WithReaderRelatedPostsInjectedProps {
	posts: string[] | undefined;
}

/**
 * HOC that fetches reader related posts via React Query for the given
 * `siteId`/`postId`/`scope` and injects `posts` (array of `global_ID`s) as a
 * prop on the wrapped component. Returns `null` on fetch error so the slot
 * stays empty rather than getting stuck on placeholders.
 *
 * Also dispatches `receivePosts` so consumers that read individual post objects
 * from `state.reader.posts` (e.g. `RelatedPostCard`) keep working.
 */
export function withReaderRelatedPosts( scope: ReadRelatedPostsScope ) {
	return function wrap< P extends WithReaderRelatedPostsInjectedProps >(
		WrappedComponent: ComponentType< P >
	): ComponentType<
		Omit< P, keyof WithReaderRelatedPostsInjectedProps > & WithReaderRelatedPostsOwnProps
	> {
		const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

		function WithReaderRelatedPosts(
			props: Omit< P, keyof WithReaderRelatedPostsInjectedProps > & WithReaderRelatedPostsOwnProps
		) {
			const { siteId, postId } = props;
			const dispatch = useDispatch();
			const contentWidth = readerContentWidth();
			const { data, isError } = useQuery(
				readRelatedPostsQuery( siteId, postId, scope, 2, contentWidth )
			);
			const fetchedPosts = data?.posts;

			useEffect( () => {
				if ( fetchedPosts ) {
					dispatch( receivePosts( fetchedPosts ) );
				}
			}, [ dispatch, fetchedPosts ] );

			if ( isError ) {
				return null;
			}

			const posts = fetchedPosts?.map( ( p ) => p.global_ID );

			return <WrappedComponent { ...( props as unknown as P ) } posts={ posts } />;
		}

		WithReaderRelatedPosts.displayName = `withReaderRelatedPosts(${ scope })(${ displayName })`;
		return WithReaderRelatedPosts;
	};
}
