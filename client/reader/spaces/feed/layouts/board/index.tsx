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

const LANES = 2;
const ESTIMATED_SIZE = 260;

function BoardCard( { post }: { post: ReadStreamPost } ) {
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
					<a className="space-feed-board__title-link" href={ fields.postHref }>
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
					{ fields.publishedDate && (
						<span className="space-feed-board__time">
							<SpaceFeedTimeSince date={ fields.publishedDate } />
						</span>
					) }
				</div>
				<div className="space-feed-board__actions">
					<ReaderPostActions
						post={ post }
						onCommentClick={ () => page( getPostUrl( post ) ) }
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
}: SpaceFeedLayoutProps ) {
	const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
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

	return (
		<div { ...getListProps( { className: 'space-feed-board' } ) }>
			{ items.map( ( virtualItem ) => (
				<div
					key={ virtualItem.key }
					data-index={ virtualItem.index }
					ref={ measureElement }
					className="space-feed-board__item"
					style={ {
						insetInlineStart: `${ ( virtualItem.lane * 100 ) / LANES }%`,
						inlineSize: `${ 100 / LANES }%`,
						transform: `translateY(${ virtualItem.start - scrollMargin }px)`,
					} }
				>
					<BoardCard post={ posts[ virtualItem.index ] } />
				</div>
			) ) }
		</div>
	);
}
