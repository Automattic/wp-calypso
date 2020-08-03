/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { Button } from '@automattic/components';
import SitePlaceholder from 'blocks/site/placeholder';
import { Item, Feed, FeedError } from './types';
import { getFeed } from 'state/reader/feeds/selectors';
import QueryReaderFeed from 'components/data/query-reader-feed';

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
					<div className="list-item__title">{ feed.name || feed.URL || feed.feed_URL }</div>
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
	onRemove: ( e: MouseEvent ) => void;
	feed: Feed | FeedError;
} ) {
	const { feed, item, onRemove } = props;
	return ! feed ? (
		// TODO: Add support for removing invalid feed list item
		<>
			<SitePlaceholder />
			<QueryReaderFeed feedId={ item.feed_ID } />
		</>
	) : (
		<>
			{ isFeedError( feed ) ? renderFeedError( feed ) : renderFeed( feed ) }
			<Button scary primary onClick={ onRemove }>
				Remove from list
			</Button>
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
