import page from '@automattic/calypso-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useMemo } from 'react';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { getPostUrl } from 'calypso/reader/route';
import { SpaceFeedTimeSince } from '../../components/time-since';
import { getPostFieldKey, getPostFields } from '../../post-fields';
import type { SpaceFeedLayoutProps } from '../types';
import type { ReadStreamPost } from '@automattic/api-core';

import './style.scss';

const COLUMNS = 3;
const ROW_SIZE = 248;

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
	const rows = useMemo< ReadStreamPost[][] >( () => {
		const out: ReadStreamPost[][] = [];
		for ( let index = 0; index < posts.length; index += COLUMNS ) {
			out.push( posts.slice( index, index + COLUMNS ) );
		}
		return out;
	}, [ posts ] );

	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
		scrollElement,
		count: rows.length,
		estimateSize: ROW_SIZE,
		overscan: 4,
		getItemKey: ( index ) => ( rows[ index ][ 0 ] ? getPostFieldKey( rows[ index ][ 0 ] ) : index ),
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	return (
		<div { ...getListProps( { className: 'space-feed-gallery' } ) }>
			{ items.map( ( virtualRow ) => (
				<div
					key={ virtualRow.key }
					data-index={ virtualRow.index }
					ref={ measureElement }
					className="space-feed-gallery__row"
					style={ { transform: `translateY(${ virtualRow.start - scrollMargin }px)` } }
				>
					{ rows[ virtualRow.index ].map( ( post ) => (
						<GalleryCard key={ getPostFieldKey( post ) } post={ post } />
					) ) }
				</div>
			) ) }
		</div>
	);
}
