import page from '@automattic/calypso-router';
import { useMemo } from 'react';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useCachedPost } from 'calypso/reader/data/post/cache';
import { type StreamPostKey } from 'calypso/reader/data/stream';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { keyForPost } from 'calypso/reader/post-key';
import { getPostUrl } from 'calypso/reader/route';
import { Shimmer } from '../../components/skeleton';
import { SpaceFeedTimeSince } from '../../components/time-since';
import { getPostFieldKey, getPostFields } from '../../post-fields';
import { useScrollSelectedIntoView } from '../use-scroll-selected-into-view';
import type { SpaceFeedLayoutProps, SpaceFeedSkeletonProps } from '../types';

import './style.scss';

const LANES = 2;
const ESTIMATED_SIZE = 260;

/** A single card-shaped shimmer, shown while a post loads from the cache. */
function BoardSkeletonCard() {
	return (
		<div className="space-feed-board__card">
			<Shimmer className="space-feed-board__skeleton-hero" />
			<div className="space-feed-board__body">
				<Shimmer className="space-feed-board__skeleton-line is-title" />
				<Shimmer className="space-feed-board__skeleton-line" />
				<Shimmer className="space-feed-board__skeleton-line is-short" />
			</div>
		</div>
	);
}

function BoardCard( {
	postKey,
	onOpen,
	showTimestamp,
}: {
	postKey: StreamPostKey | undefined;
	onOpen: () => void;
	showTimestamp: boolean;
} ) {
	const post = useCachedPost( postKey );
	if ( ! post ) {
		return <BoardSkeletonCard />;
	}
	const fields = getPostFields( post );
	return (
		<div className="space-feed-board__card">
			<div className="space-feed-board__hero">
				{ fields.imageUrl ? (
					<img className="space-feed-board__image" src={ fields.imageUrl } alt="" loading="lazy" />
				) : (
					<SiteIcon iconUrl={ fields.siteIconUrl } size={ 40 } />
				) }
			</div>
			<div className="space-feed-board__body">
				<h3 className="space-feed-board__title">
					<a className="space-feed-board__title-link" href={ fields.postHref } onClick={ onOpen }>
						{ fields.title }
					</a>
				</h3>
				{ fields.excerptHtml && (
					<div
						className="space-feed-board__excerpt"
						// Sanitized by the Reader's formatExcerpt (allows only p/br/sup/sub).
						dangerouslySetInnerHTML={ { __html: fields.excerptHtml } } // eslint-disable-line react/no-danger
					/>
				) }
				<div className="space-feed-board__footer">
					<span className="space-feed-board__source-group">
						<SiteIcon iconUrl={ fields.siteIconUrl } size={ 18 } />
						<span className="space-feed-board__source">{ fields.sourceName }</span>
					</span>
					{ showTimestamp && fields.publishedDate && (
						<span className="space-feed-board__time">
							<SpaceFeedTimeSince date={ fields.publishedDate } />
						</span>
					) }
				</div>
				<div className="space-feed-board__actions">
					<ReaderPostActions
						post={ post }
						onCommentClick={ () => {
							onOpen();
							page( getPostUrl( post ) );
						} }
						iconSize={ 18 }
					/>
				</div>
			</div>
		</div>
	);
}

export function BoardLayout( {
	posts,
	scrollElement,
	hasMore,
	isLoadingMore,
	loadMore,
	restoreKey,
	isPostSelected,
	selectPost,
	showTimestamp,
}: SpaceFeedLayoutProps ) {
	const { getListProps, items, measureElement, scrollMargin, scrollToIndex } = useInfiniteList( {
		scrollElement,
		count: posts.length,
		estimateSize: ESTIMATED_SIZE,
		overscan: 6,
		lanes: LANES,
		getItemKey: ( index ) => getPostFieldKey( posts[ index ] ),
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	const selectedIndex = useMemo(
		() => posts.findIndex( ( post ) => isPostSelected( post ) ),
		[ posts, isPostSelected ]
	);
	useScrollSelectedIntoView( scrollToIndex, selectedIndex );

	return (
		<div { ...getListProps( { className: 'space-feed-board' } ) }>
			{ items.map( ( virtualItem ) => (
				<div
					key={ virtualItem.key }
					data-index={ virtualItem.index }
					data-selected={ isPostSelected( posts[ virtualItem.index ] ) || undefined }
					ref={ measureElement }
					className="space-feed-board__item"
					style={ {
						insetInlineStart: `${ ( virtualItem.lane * 100 ) / LANES }%`,
						inlineSize: `${ 100 / LANES }%`,
						transform: `translateY(${ virtualItem.start - scrollMargin }px)`,
					} }
				>
					<BoardCard
						postKey={ keyForPost( posts[ virtualItem.index ] ) }
						onOpen={ () => selectPost( posts[ virtualItem.index ] ) }
						showTimestamp={ showTimestamp }
					/>
				</div>
			) ) }
		</div>
	);
}

/** Loading placeholder: a two-lane grid of card-shaped shimmers. */
export function BoardSkeleton( { count }: SpaceFeedSkeletonProps ) {
	return (
		<div className="space-feed-board__skeleton" aria-hidden="true">
			{ Array.from( { length: count }, ( _value, index ) => (
				<BoardSkeletonCard key={ index } />
			) ) }
		</div>
	);
}
