import { readRelatedPostsQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ComponentType, useEffect, useMemo } from 'react';
import {
	normalizeReaderPostsForCache,
	syncReaderPostCache,
} from 'calypso/reader/data/reader-post-cache-sync';
import readerContentWidth from 'calypso/reader/lib/content-width';
import type { ReadRelatedPostsScope } from '@automattic/api-core';
import type { ReaderPostCachePost } from 'calypso/reader/data/reader-post-cache';

export interface WithReaderRelatedPostsOwnProps {
	siteId: number;
	postId: number;
}

export interface WithReaderRelatedPostsInjectedProps {
	posts: ReaderPostCachePost[] | undefined;
}

/**
 * HOC that fetches reader related posts via React Query for the given
 * `siteId`/`postId`/`scope` and injects full related `posts` as a
 * prop on the wrapped component. Returns `null` only when the fetch errors
 * and there are no cached posts, so cached posts remain visible across
 * transient refetch errors instead of the slot getting stuck on placeholders.
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
			const { siteId, postId, ...rest } = props;
			const queryClient = useQueryClient();
			const contentWidth = readerContentWidth();
			const { data, isError } = useQuery(
				readRelatedPostsQuery( siteId, postId, scope, 2, contentWidth )
			);
			const fetchedPosts = useMemo(
				() => normalizeReaderPostsForCache( data?.posts ?? [] ),
				[ data?.posts ]
			);

			useEffect( () => {
				if ( data?.posts?.length ) {
					syncReaderPostCache( queryClient, data.posts );
				}
			}, [ data?.posts, queryClient ] );

			// Keep cached posts visible across transient refetch errors.
			if ( isError && fetchedPosts.length === 0 ) {
				return null;
			}

			return (
				<WrappedComponent
					{ ...( rest as unknown as P ) }
					posts={ fetchedPosts.length > 0 ? fetchedPosts : undefined }
				/>
			);
		}

		WithReaderRelatedPosts.displayName = `withReaderRelatedPosts(${ scope })(${ displayName })`;
		return WithReaderRelatedPosts;
	};
}
