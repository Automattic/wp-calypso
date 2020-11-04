/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { Button } from '@automattic/components';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import { Item, Feed, FeedError } from './types';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import FeedTitle from './feed-title';

function isFeedError( feed: Feed | FeedError ): feed is FeedError {
	return 'errors' in feed;
}

function renderFeed( feed: Feed ) {
	return (
		<div className="feed-item list-item">
			<a className="list-item__content" href={ `/read/feeds/${ feed.feed_ID }` }>
				<div className="list-item__icon">
					{ feed.image && <img src={ feed.image } className="list-item__img image" alt="" /> }
					{ ! feed.image && <Gridicon icon="site" size={ 36 } /> }
				</div>

				<div className="list-item__info">
					<div className="list-item__title">
						<FeedTitle feed={ feed } />
					</div>
					<div className="list-item__domain">{ feed.feed_URL }</div>
				</div>
			</a>
		</div>
	);
}

function renderFeedError( err: FeedError ) {
	return (
		<div className="feed-item list-item is-error">
			<div className="list-item__content">
				<div className="list-item__icon">
					<Gridicon icon="notice" size={ 24 } />
				</div>

				<div className="list-item__info">
					<div className="list-item__title">
						{ err.error_data.no_such_feed ? 'Site has been deleted' : 'Unknown error' }
					</div>
				</div>
			</div>
		</div>
	);
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
function FeedItem( props: {
	item: Item;
	onAdd?: ( e: MouseEvent ) => void;
	onRemove?: ( e: MouseEvent ) => void;
	feed: Feed | FeedError;
} ) {
	const { feed, item } = props;
	const translate = useTranslate();

	return ! feed ? (
		// TODO: Add support for removing invalid feed list item
		<>
			<SitePlaceholder />
			<QueryReaderFeed feedId={ +item.feed_ID } />
		</>
	) : (
		<>
			{ isFeedError( feed ) ? renderFeedError( feed ) : renderFeed( feed ) }
			{ !! props.onAdd && (
				<Button primary onClick={ props.onAdd }>
					{ translate( 'Follow' ) }
				</Button>
			) }
			{ !! props.onRemove && (
				<Button primary onClick={ props.onRemove }>
					{ translate( 'Remove' ) }
				</Button>
			) }
		</>
	);
}

export default connect(
	( state, ownProps: { item: Item; onRemove: ( e: MouseEvent ) => void } ) => {
		let feed: Feed | FeedError = ownProps.item.meta?.data?.feed as Feed | FeedError;

		if ( ! feed && ownProps.item.feed_ID ) {
			feed = getFeed( state, ownProps.item.feed_ID ) as Feed | FeedError;
		}
		return {
			feed,
		};
	}
)( FeedItem );
