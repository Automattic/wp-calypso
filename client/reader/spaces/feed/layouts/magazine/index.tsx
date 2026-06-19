import page from '@automattic/calypso-router';
import ReaderPostActions from 'calypso/blocks/reader-post-actions';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { useInfiniteList } from 'calypso/reader/hooks/use-infinite-list';
import { getPostUrl } from 'calypso/reader/route';
import { SpaceFeedTimeSince } from '../../components/time-since';
import { getPostFieldKey, getPostFields } from '../../post-fields';
import type { SpaceFeedLayoutProps } from '../types';
import type { ReadStreamPost } from '@automattic/api-core';

import './style.scss';

const ESTIMATED_SIZE = 420;

function MagazineCard( { post }: { post: ReadStreamPost } ) {
	const fields = getPostFields( post );
	const metaText = [ fields.authorName, fields.siteDomain ].filter( Boolean ).join( ' · ' );
	return (
		<div className="space-feed-magazine__card">
			<div className="space-feed-magazine__hero">
				{ fields.imageUrl ? (
					<img
						className="space-feed-magazine__image"
						src={ fields.imageUrl }
						alt=""
						loading="lazy"
					/>
				) : (
					<SiteIcon iconUrl={ fields.siteIconUrl } size={ 48 } />
				) }
			</div>
			<div className="space-feed-magazine__byline">
				<SiteIcon iconUrl={ fields.siteIconUrl } size={ 24 } />
				<span className="space-feed-magazine__kicker">{ fields.sourceName }</span>
			</div>
			<h3 className="space-feed-magazine__title">
				<a className="space-feed-magazine__title-link" href={ fields.postHref }>
					{ fields.title }
				</a>
			</h3>
			{ fields.excerptHtml && (
				<div
					className="space-feed-magazine__excerpt"
					// Sanitized by the Reader's formatExcerpt (allows only p/br/sup/sub).
					dangerouslySetInnerHTML={ { __html: fields.excerptHtml } } // eslint-disable-line react/no-danger
				/>
			) }
			{ ( metaText || fields.publishedDate ) && (
				<p className="space-feed-magazine__meta">
					{ metaText }
					{ metaText && fields.publishedDate ? ' · ' : '' }
					{ fields.publishedDate && <SpaceFeedTimeSince date={ fields.publishedDate } /> }
				</p>
			) }
			<div className="space-feed-magazine__actions">
				<ReaderPostActions
					post={ post }
					onCommentClick={ () => page( getPostUrl( post ) ) }
					iconSize={ 18 }
				/>
			</div>
		</div>
	);
}

export function MagazineLayout( {
	posts,
	scrollElement,
	hasMore,
	isLoadingMore,
	loadMore,
	restoreKey,
}: SpaceFeedLayoutProps ) {
	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
		scrollElement,
		count: posts.length,
		estimateSize: ESTIMATED_SIZE,
		overscan: 4,
		getItemKey: ( index ) => getPostFieldKey( posts[ index ] ),
		hasMore,
		isLoadingMore,
		loadMore,
		restoreKey,
	} );

	return (
		<div { ...getListProps( { className: 'space-feed-magazine' } ) }>
			{ items.map( ( virtualItem ) => (
				<div
					key={ virtualItem.key }
					data-index={ virtualItem.index }
					ref={ measureElement }
					className="space-feed-magazine__item"
					style={ { transform: `translateY(${ virtualItem.start - scrollMargin }px)` } }
				>
					<MagazineCard post={ posts[ virtualItem.index ] } />
				</div>
			) ) }
		</div>
	);
}
