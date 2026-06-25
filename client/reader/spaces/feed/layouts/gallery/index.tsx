import page from '@automattic/calypso-router';
import { useBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { getPostUrl } from 'calypso/reader/route';
import { SpaceFeedTimeSince } from '../../components/time-since';
import { getPostFieldKey, getPostFields } from '../../post-fields';
import type { SpaceFeedLayoutProps } from '../types';
import type { ReadStreamPost } from '@automattic/api-core';

import './style.scss';

// Card is a fixed 270px; the item adds 40px of block padding (20px top + bottom).
const ROW_SIZE = 310;

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
	// Responsive column count: 3 on desktop, 2 on tablet, 1 on mobile. Each post is
	// its own virtual item spread across `columns` lanes — the virtualizer handles
	// the main-axis (vertical) position; the cross-axis (left/width) is stable per
	// item and set in JSX, per TanStack Virtual's multi-lane guidance.
	const isDesktop = useBreakpoint( '>960px' );
	const isTablet = useBreakpoint( '>660px' );
	let columns = 1;
	if ( isDesktop ) {
		columns = 3;
	} else if ( isTablet ) {
		columns = 2;
	}

	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
		scrollElement,
		count: posts.length,
		estimateSize: ROW_SIZE,
		overscan: 4,
		lanes: columns,
		getItemKey: ( index ) => getPostFieldKey( posts[ index ] ),
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	return (
		<div { ...getListProps( { className: 'space-feed-gallery' } ) }>
			{ items.map( ( virtualItem ) => (
				<div
					key={ virtualItem.key }
					data-index={ virtualItem.index }
					ref={ measureElement }
					className="space-feed-gallery__item"
					style={ {
						insetInlineStart: `${ ( virtualItem.lane * 100 ) / columns }%`,
						inlineSize: `${ 100 / columns }%`,
						transform: `translateY(${ virtualItem.start - scrollMargin }px)`,
					} }
				>
					<GalleryCard post={ posts[ virtualItem.index ] } />
				</div>
			) ) }
		</div>
	);
}
