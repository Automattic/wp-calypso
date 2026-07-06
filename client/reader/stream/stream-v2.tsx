import { isDefaultLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { INITIAL_FETCH, PER_FETCH, useInfiniteStream } from 'calypso/reader/data/stream';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { keysAreEqual, keyToString } from 'calypso/reader/post-key';
import { showSelectedPost } from 'calypso/reader/utils';
import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import isNotificationsOpen from 'calypso/state/selectors/is-notifications-open';
import PostLifecycleUntyped from './post-lifecycle';
import PostPlaceholderUntyped from './post-placeholder';
import { useSelectedPostCommands } from './use-selected-post-commands';
import { useStreamKeyboardShortcuts } from './use-stream-keyboard-shortcuts';
import { useStreamPostKeySelection } from './use-stream-post-key-selection';
import type { StreamItem } from 'calypso/reader/data/stream/types';
import type { ComponentType, ReactNode } from 'react';

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
	isSelected?: boolean;
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
	/** Replaces the default "nothing here yet" state when the stream is empty. */
	emptyContent?: ReactNode;
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
	emptyContent,
}: ReaderStreamV2Props ) {
	const translate = useTranslate();
	const blockedSites = useSelector( getBlockedSites );
	const rawLocale = useSelector( getCurrentLocaleSlug );
	const localeSlug = rawLocale && ! isDefaultLocale( rawLocale ) ? rawLocale : null;
	const { items, isLoading, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useInfiniteStream( {
			streamKey,
			localeSlug,
		} );

	const { selectedPostKey, selectPostKey, selectNextPost, selectPreviousPost, selectedPostIndex } =
		useStreamPostKeySelection( {
			streamKey,
			localeSlug,
			items,
		} );

	// Open the full-post view on click, mirroring the classic stream. `showSelectedPost`
	// returns a thunk that navigates via the router (no Redux dispatch needed), so we
	// invoke it directly with the clicked item's post key.
	const openPost = useCallback(
		( postKey: StreamItem, comments?: boolean ) => {
			selectPostKey( postKey );
			showSelectedPost( {
				postKey: {
					blogId: postKey.blogId ? Number( postKey.blogId ) : undefined,
					feedId: postKey.feedId ? Number( postKey.feedId ) : undefined,
					postId: Number( postKey.postId ),
				},
				comments,
			} )();
		},
		[ selectPostKey ]
	);

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
		scrollToIndex,
	} = useInfiniteList( {
		scrollElement,
		count,
		estimateSize: GUESSED_POST_HEIGHT,
		getItemKey: ( index ) =>
			index < items.length ? keyToString( items[ index ] ) ?? index : `placeholder-${ index }`,
		overscan: 6,
		hasMore: hasNextPage,
		isLoadingMore: isFetchingNextPage,
		loadMore: fetchNextPage,
		restoreKey,
	} );

	const notificationsOpen = useSelector( isNotificationsOpen );
	const { openSelected, openSelectedInNewTab, toggleSelectedLike } =
		useSelectedPostCommands( selectedPostKey );

	useStreamKeyboardShortcuts( {
		enabled: ! notificationsOpen,
		onNext: selectNextPost,
		onPrevious: selectPreviousPost,
		onOpen: openSelected,
		onOpenInNewTab: openSelectedInNewTab,
		onToggleLike: toggleSelectedLike,
	} );

	// Keep the keyboard-selected card in view. `auto` only scrolls when the item
	// is off-screen, so click-selection (list already steady) doesn't jump.
	useEffect( () => {
		if ( selectedPostIndex >= 0 ) {
			scrollToIndex( selectedPostIndex, { align: 'auto' } );
		}
	}, [ selectedPostIndex, scrollToIndex ] );

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
		// `undefined` means the caller passed nothing; any explicitly provided node
		// (including `null` to render nothing) overrides the default empty state.
		if ( emptyContent !== undefined ) {
			return <>{ emptyContent }</>;
		}
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
							isSelected={
								selectedPostKey != null &&
								keysAreEqual( items[ virtualItem.index ], selectedPostKey )
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
