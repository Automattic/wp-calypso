import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
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
import type { ReadStreamPost } from '@automattic/api-core';

import './style.scss';

// Card is a fixed 270px; the grid row adds 40px of block-end padding.
const ROW_SIZE = 310;

// Responsive column count shared by the layout and its skeleton: 3 on desktop,
// 2 on tablet, 1 on mobile.
function useGalleryColumns(): number {
	const isDesktop = useBreakpoint( '>960px' );
	const isTablet = useBreakpoint( '>660px' );
	if ( isDesktop ) {
		return 3;
	}
	if ( isTablet ) {
		return 2;
	}
	return 1;
}

function GalleryCard( {
	postKey,
	isSelected,
	onOpen,
	showTimestamp,
}: {
	postKey: StreamPostKey | undefined;
	isSelected: boolean;
	onOpen: () => void;
	showTimestamp: boolean;
} ) {
	const post = useCachedPost( postKey );
	if ( ! post ) {
		return <GallerySkeletonCard />;
	}
	const fields = getPostFields( post );
	return (
		<VStack
			className="space-feed-gallery__card"
			spacing={ 1.5 }
			alignment="stretch"
			data-selected={ isSelected || undefined }
		>
			<a
				className="space-feed-gallery__thumb"
				href={ fields.postHref }
				aria-label={ fields.title }
				onClick={ onOpen }
			>
				{ fields.imageUrl ? (
					<img
						className="space-feed-gallery__image"
						src={ fields.imageUrl }
						alt=""
						loading="lazy"
					/>
				) : (
					<SiteIcon iconUrl={ fields.siteIconUrl } size={ 40 } />
				) }
			</a>
			<VStack spacing={ 4 }>
				<VStack spacing={ 1 }>
					<HStack
						className="space-feed-gallery__meta"
						spacing={ 2 }
						alignment="center"
						justify="flex-start"
					>
						<SiteIcon iconUrl={ fields.siteIconUrl } size={ 20 } />
						<span>
							{ fields.sourceName }
							{ fields.authorName ? ` · ${ fields.authorName }` : '' }
						</span>
						{ showTimestamp && fields.publishedDate && (
							<>
								<span>-</span>
								<SpaceFeedTimeSince date={ fields.publishedDate } />
								<span className="space-feed-gallery__time"></span>
							</>
						) }
					</HStack>
					<h3 className="space-feed-gallery__title">
						<a
							className="space-feed-gallery__title-link"
							href={ fields.postHref }
							onClick={ onOpen }
						>
							{ fields.title }
						</a>
					</h3>
				</VStack>
				<ReaderPostActions
					variant="discreet"
					split
					post={ post }
					onCommentClick={ () => {
						onOpen();
						page( getPostUrl( post ) );
					} }
					iconSize={ 18 }
				/>
			</VStack>
		</VStack>
	);
}

/** A single shimmering placeholder card matching the gallery card shape. */
function GallerySkeletonCard() {
	return (
		<VStack className="space-feed-gallery__card" spacing={ 1.5 } alignment="stretch">
			<span className="space-feed-gallery__thumb">
				<Shimmer className="space-feed-gallery__image" />
			</span>
			<VStack spacing={ 1 }>
				<Shimmer className="space-feed-gallery__skeleton-line is-meta" />
				<Shimmer className="space-feed-gallery__skeleton-line" />
				<Shimmer className="space-feed-gallery__skeleton-line is-short" />
			</VStack>
		</VStack>
	);
}

export function GalleryLayout( {
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
	const columns = useGalleryColumns();

	// Chunk posts into grid rows of `columns` and virtualize per row. Fixed-height
	// cards keep each row uniform. While loading more, append placeholder cells
	// (`null`) — enough to finish the last incomplete row plus one more row — so the
	// skeleton continues the grid inline instead of starting a separate block below.
	const rows = useMemo< ( ReadStreamPost | null )[][] >( () => {
		const cells: ( ReadStreamPost | null )[] = [ ...posts ];
		if ( isLoadingMore ) {
			const remaining = ( columns - ( posts.length % columns ) ) % columns;
			for ( let index = 0; index < remaining + columns; index++ ) {
				cells.push( null );
			}
		}
		const out: ( ReadStreamPost | null )[][] = [];
		for ( let index = 0; index < cells.length; index += columns ) {
			out.push( cells.slice( index, index + columns ) );
		}
		return out;
	}, [ posts, columns, isLoadingMore ] );

	const { getListProps, items, measureElement, scrollMargin, scrollToIndex } = useInfiniteList( {
		scrollElement,
		count: rows.length,
		estimateSize: ROW_SIZE,
		overscan: 12,
		getItemKey: ( index ) => {
			const first = rows[ index ][ 0 ];
			return first ? getPostFieldKey( first ) : `skeleton-${ index }`;
		},
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	// Grid row holding the selected post.
	const selectedRowIndex = useMemo(
		() =>
			rows.findIndex( ( row ) => row.some( ( cell ) => cell != null && isPostSelected( cell ) ) ),
		[ rows, isPostSelected ]
	);
	useScrollSelectedIntoView( scrollToIndex, selectedRowIndex );

	return (
		<div { ...getListProps( { className: 'space-feed-gallery' } ) }>
			{ items.map( ( virtualRow ) => (
				<div
					key={ virtualRow.key }
					data-index={ virtualRow.index }
					ref={ measureElement }
					className="space-feed-gallery__item"
					style={ { transform: `translateY(${ virtualRow.start - scrollMargin }px)` } }
				>
					<div
						className="space-feed-gallery__row"
						style={ { gridTemplateColumns: `repeat(${ columns }, 1fr)` } }
					>
						{ rows[ virtualRow.index ].map( ( cell, cellIndex ) =>
							cell ? (
								<GalleryCard
									key={ getPostFieldKey( cell ) }
									postKey={ keyForPost( cell ) }
									isSelected={ isPostSelected( cell ) }
									onOpen={ () => selectPost( cell ) }
									showTimestamp={ showTimestamp }
								/>
							) : (
								// eslint-disable-next-line react/no-array-index-key
								<GallerySkeletonCard key={ `skeleton-${ cellIndex }` } />
							)
						) }
					</div>
				</div>
			) ) }
		</div>
	);
}

/** Loading placeholder: a responsive grid of card-shaped shimmers. */
export function GallerySkeleton( { count }: SpaceFeedSkeletonProps ) {
	const columns = useGalleryColumns();
	return (
		<div
			className="space-feed-gallery__skeleton"
			style={ { gridTemplateColumns: `repeat(${ columns }, 1fr)` } }
			aria-hidden="true"
		>
			{ Array.from( { length: count }, ( _value, index ) => (
				// eslint-disable-next-line react/no-array-index-key
				<GallerySkeletonCard key={ index } />
			) ) }
		</div>
	);
}
