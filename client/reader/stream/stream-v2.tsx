import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { INITIAL_FETCH, PER_FETCH, useInfiniteStream } from 'calypso/reader/data/stream';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { keyToString } from 'calypso/reader/post-key';
import { showSelectedPost } from 'calypso/reader/utils';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import PostLifecycleUntyped from './post-lifecycle';
import PostPlaceholderUntyped from './post-placeholder';
import type { StreamItem } from 'calypso/reader/data/stream/types';
import type { ComponentType } from 'react';

// The card calls this when a post (or its comment button) is clicked.
type PostClickArgs = { comments?: boolean };

// `post-lifecycle` / `post-placeholder` are untyped legacy JSX. Describe only the
// props this stream passes; PostLifecycle fetches its own post (useCachedPost) and
// dispatches its own analytics, so it works standalone with Calypso's providers.
const PostLifecycle = PostLifecycleUntyped as ComponentType< {
	postKey: StreamItem;
	streamKey: string;
	blockedSites: number[];
	index: number;
	handleClick: ( args?: PostClickArgs ) => void;
} >;
const PostPlaceholder = PostPlaceholderUntyped as ComponentType;

// Average rendered post-card height; the virtualizer measures the real size after mount.
const GUESSED_POST_HEIGHT = 600;

interface ReaderStreamV2Props {
	streamKey: string;
	/** The scrollable container (passed as state so the virtualizer re-evaluates once it mounts). */
	scrollElement: HTMLElement | null;
	className?: string;
	restoreKey?: string;
}

/**
 * ⚠️ EXPERIMENTAL / UNSTABLE — built for the Spaces feed proof-of-concept on the
 * experimental `useInfiniteList` engine; not yet a stable replacement for the
 * classic stream. The API may change without notice.
 *
 * A slim, hook-based Reader stream: `useInfiniteStream` for data + `useInfiniteList`
 * for windowing + the existing `PostLifecycle` for per-post rendering. The modern
 * replacement for the legacy Redux + `<InfiniteList>` stream, used first by the
 * Spaces "legacy" feed layout.
 */
export function ReaderStreamV2( {
	streamKey,
	scrollElement,
	className,
	restoreKey,
}: ReaderStreamV2Props ) {
	const translate = useTranslate();
	const blockedSites = useSelector( getBlockedSites );
	const { items, isLoading, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useInfiniteStream( {
			streamKey,
		} );

	// Open the full-post view on click, mirroring the classic stream. `showSelectedPost`
	// returns a thunk that navigates via the router (no Redux dispatch needed), so we
	// invoke it directly with the clicked item's post key.
	const openPost = useCallback( ( postKey: StreamItem, comments?: boolean ) => {
		showSelectedPost( {
			postKey: {
				blogId: postKey.blogId ? Number( postKey.blogId ) : undefined,
				feedId: postKey.feedId ? Number( postKey.feedId ) : undefined,
				postId: Number( postKey.postId ),
			},
			comments,
		} )();
	}, [] );

	// While a next page loads, append PER_FETCH skeleton rows at the tail (v1 showed
	// these via InfiniteList's renderLoadingPlaceholders). Indices past the real
	// items have no post, so they render a <PostPlaceholder/>.
	const trailingSkeletons = isFetchingNextPage && hasNextPage ? PER_FETCH : 0;
	const count = items.length + trailingSkeletons;

	const {
		getListProps,
		items: virtualItems,
		measureElement,
		scrollMargin,
	} = useInfiniteList( {
		scrollElement,
		count,
		estimateSize: GUESSED_POST_HEIGHT,
		getItemKey: ( index ) =>
			index < items.length ? keyToString( items[ index ] ) ?? index : `placeholder-${ index }`,
		overscan: 3,
		hasMore: hasNextPage,
		isLoadingMore: isFetchingNextPage,
		loadMore: fetchNextPage,
		restoreKey,
	} );

	if ( isLoading && items.length === 0 ) {
		return (
			<div className={ className }>
				{ Array.from( { length: INITIAL_FETCH } ).map( ( _, index ) => (
					<PostPlaceholder key={ `placeholder-${ index }` } />
				) ) }
			</div>
		);
	}

	if ( error && items.length === 0 ) {
		return (
			<div className="space-feed__status">
				<p className="space-feed__status-title">{ translate( 'Couldn’t load this feed' ) }</p>
				<Button variant="secondary" onClick={ refetch }>
					{ translate( 'Try again' ) }
				</Button>
			</div>
		);
	}

	if ( items.length === 0 ) {
		return (
			<div className="space-feed__status">
				<p className="space-feed__status-title">{ translate( 'Nothing here yet' ) }</p>
				<p className="space-feed__status-line">
					{ translate( 'Posts from this space’s sources will show up here.' ) }
				</p>
			</div>
		);
	}

	return (
		<div { ...getListProps( { className } ) }>
			{ virtualItems.map( ( virtualItem ) => (
				<div
					key={ virtualItem.key }
					data-index={ virtualItem.index }
					ref={ measureElement }
					style={ {
						position: 'absolute',
						insetInlineStart: 0,
						inlineSize: '100%',
						transform: `translateY(${ virtualItem.start - scrollMargin }px)`,
					} }
				>
					{ virtualItem.index < items.length ? (
						<PostLifecycle
							postKey={ items[ virtualItem.index ] }
							streamKey={ streamKey }
							blockedSites={ blockedSites }
							index={ virtualItem.index }
							handleClick={ ( args?: PostClickArgs ) =>
								openPost( items[ virtualItem.index ], args?.comments )
							}
						/>
					) : (
						<PostPlaceholder />
					) }
				</div>
			) ) }
		</div>
	);
}

export default ReaderStreamV2;
