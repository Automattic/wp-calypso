/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { ItemType } from './types';
import FeedItem from './feed-item';
import SiteItem from './site-item';

function renderPlaceholderContent( item: ItemType ) {
	return <pre>{ JSON.stringify( item, null, 2 ) }</pre>;
}

export default function ListItem( props: { item: ItemType } ) {
	const { item } = props;
	return (
		<Card className="list-manage__site-card">
			{ item.feed_ID !== null && <FeedItem item={ item } /> }
			{ item.site_ID !== null && <SiteItem item={ item } /> }
			{ item.tag_ID !== null && renderPlaceholderContent( item ) }
		</Card>
	);
}
