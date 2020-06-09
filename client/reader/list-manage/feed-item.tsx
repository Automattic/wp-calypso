/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { Button } from '@automattic/components';
import SitePlaceholder from 'blocks/site/placeholder';
import { getFeed } from 'state/reader/feeds/selectors';
import QueryReaderFeed from 'components/data/query-reader-feed';
import { ItemType, Feed } from './types';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function FeedItem( props: { item: ItemType; onRemove: ( e: MouseEvent ) => void } ) {
	const feedId = props.item.feed_ID as number;
	const feed: Feed = useSelector( ( state ) => getFeed( state, feedId ) ) as Feed;

	return ! feed ? (
		<>
			<QueryReaderFeed feedId={ feedId } />
			<SitePlaceholder />
		</>
	) : (
		<>
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
			<Button scary primary onClick={ props.onRemove }>
				Remove from list
			</Button>
		</>
	);
}
