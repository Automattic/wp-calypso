import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { getPostUrl } from 'calypso/reader/route';
import { Shimmer } from '../../components/skeleton';
import { SpaceFeedTimeSince } from '../../components/time-since';
import { getPostFieldKey, getPostFields, type SpaceFeedDayGroup } from '../../post-fields';
import type { SpaceFeedLayoutProps, SpaceFeedSkeletonProps } from '../types';
import type { ReadStreamPost } from '@automattic/api-core';

import './style.scss';

const HEADER_SIZE = 44;
// Card is a fixed 270px; the grid row adds 40px of block-end padding.
const ROW_SIZE = 310;

type GalleryRow =
	| { kind: 'header'; key: string; label: string }
	| { kind: 'posts'; key: string; posts: ReadStreamPost[] };

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

function GalleryCard( { post }: { post: ReadStreamPost } ) {
	const fields = getPostFields( post );
	return (
		<VStack className="space-feed-gallery__card" spacing={ 1.5 } alignment="stretch">
			<a className="space-feed-gallery__thumb" href={ fields.postHref } aria-label={ fields.title }>
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
						{ fields.publishedDate && (
							<>
								<span>-</span>
								<SpaceFeedTimeSince date={ fields.publishedDate } />
								<span className="space-feed-gallery__time"></span>
							</>
						) }
					</HStack>
					<h3 className="space-feed-gallery__title">
						<a className="space-feed-gallery__title-link" href={ fields.postHref }>
							{ fields.title }
						</a>
					</h3>
				</VStack>
				<ReaderPostActions
					variant="discreet"
					split
					post={ post }
					onCommentClick={ () => page( getPostUrl( post ) ) }
					iconSize={ 18 }
				/>
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
}: SpaceFeedLayoutProps ) {
	const translate = useTranslate();
	const columns = useGalleryColumns();

	// Build virtual rows: a full-width day header (Today / Yesterday / …) followed
	// by CSS-grid rows of up to `columns` cards from that same day — the day
	// grouping mirrors the standard list. Fixed-height cards keep each grid row
	// uniform, so virtualizing per row (rather than per card) stays simple.
	const rows = useMemo< GalleryRow[] >( () => {
		const labelFor = ( group: Exclude< SpaceFeedDayGroup, '' > ): string => {
			switch ( group ) {
				case 'today':
					return translate( 'Today' );
				case 'yesterday':
					return translate( 'Yesterday' );
				case 'earlier':
					return translate( 'Earlier this week' );
				case 'older':
					return translate( 'Older' );
			}
		};

		const out: GalleryRow[] = [];
		let buffer: ReadStreamPost[] = [];
		const flush = () => {
			for ( let index = 0; index < buffer.length; index += columns ) {
				const slice = buffer.slice( index, index + columns );
				out.push( {
					kind: 'posts',
					key: `posts-${ getPostFieldKey( slice[ 0 ] ) }`,
					posts: slice,
				} );
			}
			buffer = [];
		};

		let lastGroup: SpaceFeedDayGroup = '';
		posts.forEach( ( post, index ) => {
			const { dayGroup } = getPostFields( post );
			if ( dayGroup && dayGroup !== lastGroup ) {
				flush();
				out.push( {
					kind: 'header',
					key: `header-${ dayGroup }-${ index }`,
					label: labelFor( dayGroup ),
				} );
				lastGroup = dayGroup;
			}
			buffer.push( post );
		} );
		flush();
		return out;
	}, [ posts, columns, translate ] );

	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
		scrollElement,
		count: rows.length,
		estimateSize: ( index ) => ( rows[ index ].kind === 'header' ? HEADER_SIZE : ROW_SIZE ),
		overscan: 4,
		getItemKey: ( index ) => rows[ index ].key,
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	return (
		<div { ...getListProps( { className: 'space-feed-gallery' } ) }>
			{ items.map( ( virtualRow ) => {
				const row = rows[ virtualRow.index ];
				return (
					<div
						key={ virtualRow.key }
						data-index={ virtualRow.index }
						ref={ measureElement }
						className="space-feed-gallery__item"
						style={ { transform: `translateY(${ virtualRow.start - scrollMargin }px)` } }
					>
						{ row.kind === 'header' ? (
							<h2 className="space-feed-gallery__group">{ row.label }</h2>
						) : (
							<div
								className="space-feed-gallery__row"
								style={ { gridTemplateColumns: `repeat(${ columns }, 1fr)` } }
							>
								{ row.posts.map( ( post ) => (
									<GalleryCard key={ getPostFieldKey( post ) } post={ post } />
								) ) }
							</div>
						) }
					</div>
				);
			} ) }
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
				<VStack
					key={ index }
					className="space-feed-gallery__card"
					spacing={ 1.5 }
					alignment="stretch"
				>
					<span className="space-feed-gallery__thumb">
						<Shimmer className="space-feed-gallery__image" />
					</span>
					<VStack spacing={ 1 }>
						<Shimmer className="space-feed-gallery__skeleton-line is-meta" />
						<Shimmer className="space-feed-gallery__skeleton-line" />
						<Shimmer className="space-feed-gallery__skeleton-line is-short" />
					</VStack>
				</VStack>
			) ) }
		</div>
	);
}
