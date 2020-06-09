/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { Button } from '@automattic/components';
import SitePlaceholder from 'blocks/site/placeholder';
import { Item, Feed } from './types';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export default function FeedItem( props: { item: Item; onRemove: ( e: MouseEvent ) => void } ) {
	const feed: Feed = props.item.meta.data?.feed as Feed;

	return ! feed ? (
		// TODO: Add support for removing invalid feed list item
		<SitePlaceholder />
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
