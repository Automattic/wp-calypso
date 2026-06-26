import page from '@automattic/calypso-router';
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
import { getPostFields, type SpaceFeedDayGroup, type SpaceFeedPostFields } from '../../post-fields';
import type { SpaceFeedLayoutProps, SpaceFeedSkeletonProps } from '../types';
import type { ReadStreamPost } from '@automattic/api-core';

import './style.scss';

type Row =
	| { kind: 'header'; key: string; label: string }
	| { kind: 'post'; key: string; fields: SpaceFeedPostFields; post: ReadStreamPost };

const HEADER_SIZE = 44;
const ROW_SIZE = 170;

function PostRow( { fields, post }: { fields: SpaceFeedPostFields; post: ReadStreamPost } ) {
	return (
		<HStack className="space-feed-standard-list__row" spacing={ 3 } alignment="flex-start">
			<VStack className="space-feed-standard-list__body" spacing={ 3 } alignment="stretch">
				<VStack className="space-feed-standard-list__headline" spacing={ 1 } alignment="stretch">
					<h3 className="space-feed-standard-list__title">
						<a className="space-feed-standard-list__title-link" href={ fields.postHref }>
							{ fields.title }
						</a>
					</h3>
					{ fields.excerptHtml && (
						<div
							className="space-feed-standard-list__excerpt"
							// Sanitized by the Reader's formatExcerpt (allows only p/br/sup/sub).
							dangerouslySetInnerHTML={ { __html: fields.excerptHtml } } // eslint-disable-line react/no-danger
						/>
					) }
				</VStack>
				<HStack
					className="space-feed-standard-list__source-row"
					spacing={ 2 }
					alignment="center"
					justify="flex-start"
				>
					<SiteIcon iconUrl={ fields.siteIconUrl } size={ 20 } />
					<span className="space-feed-standard-list__source">{ fields.sourceName }</span>
					{ fields.authorName && (
						<span className="space-feed-standard-list__tag">{ fields.authorName }</span>
					) }
					{ fields.siteDomain && (
						<span className="space-feed-standard-list__tag">{ fields.siteDomain }</span>
					) }
				</HStack>
				<ReaderPostActions
					post={ post }
					onCommentClick={ () => page( getPostUrl( post ) ) }
					iconSize={ 18 }
					variant="discreet"
				/>
			</VStack>
			<div className="space-feed-standard-list__aside">
				{ fields.publishedDate && (
					<span className="space-feed-standard-list__time">
						<SpaceFeedTimeSince date={ fields.publishedDate } />
					</span>
				) }
			</div>
		</HStack>
	);
}

export function StandardListLayout( {
	posts,
	scrollElement,
	hasMore,
	isLoadingMore,
	loadMore,
	restoreKey,
}: SpaceFeedLayoutProps ) {
	const translate = useTranslate();

	const rows = useMemo< Row[] >( () => {
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

		const out: Row[] = [];
		let lastGroup: SpaceFeedDayGroup = '';
		posts.forEach( ( post, index ) => {
			const fields = getPostFields( post );
			const { dayGroup, key } = fields;
			if ( dayGroup && dayGroup !== lastGroup ) {
				out.push( {
					kind: 'header',
					key: `header-${ dayGroup }-${ index }`,
					label: labelFor( dayGroup ),
				} );
				lastGroup = dayGroup;
			}
			out.push( { kind: 'post', key: `post-${ key }`, fields, post } );
		} );
		return out;
	}, [ posts, translate ] );

	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
		scrollElement,
		count: rows.length,
		estimateSize: ( index ) => ( rows[ index ].kind === 'header' ? HEADER_SIZE : ROW_SIZE ),
		getItemKey: ( index ) => rows[ index ].key,
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	// The first post row tightens its top padding (the day-group header above it
	// already supplies the gap). Detect it by index so it stays correct under
	// virtualization, where the first rendered DOM node isn't always row 0.
	const firstPostIndex = rows.findIndex( ( row ) => row.kind === 'post' );

	return (
		<div { ...getListProps( { className: 'space-feed-standard-list' } ) }>
			{ items.map( ( virtualRow ) => {
				const row = rows[ virtualRow.index ];
				return (
					<div
						key={ virtualRow.key }
						data-index={ virtualRow.index }
						data-first={ virtualRow.index === firstPostIndex || undefined }
						ref={ measureElement }
						className="space-feed-standard-list__item"
						style={ { transform: `translateY(${ virtualRow.start - scrollMargin }px)` } }
					>
						{ row.kind === 'header' ? (
							<h2 className="space-feed-standard-list__group">{ row.label }</h2>
						) : (
							<PostRow fields={ row.fields } post={ row.post } />
						) }
					</div>
				);
			} ) }
		</div>
	);
}

/** Loading placeholder: stacked rows of shimmer lines matching the list rows. */
export function StandardListSkeleton( { count }: SpaceFeedSkeletonProps ) {
	return (
		<div aria-hidden="true">
			{ Array.from( { length: count }, ( _value, index ) => (
				<div className="space-feed-standard-list__skeleton-row" key={ index }>
					<Shimmer className="space-feed-standard-list__skeleton-line is-title" />
					<Shimmer className="space-feed-standard-list__skeleton-line" />
					<Shimmer className="space-feed-standard-list__skeleton-line is-meta" />
				</div>
			) ) }
		</div>
	);
}
