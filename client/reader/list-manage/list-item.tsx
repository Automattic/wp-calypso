/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { Item } from './types';
import FeedItem from './feed-item';
import SiteItem from './site-item';
import TagItem from './tag-item';

export default function ListItem( props: { item: Item; owner: string; list: any } ) {
	const { item, owner, list } = props;
	return (
		<>
			<Card className="list-manage__site-card">
				{ item.feed_ID && <FeedItem item={ item } owner={ owner } list={ list } /> }
				{ item.site_ID && <SiteItem item={ item } owner={ owner } list={ list } /> }
				{ item.tag_ID && <TagItem item={ item } owner={ owner } list={ list } /> }
			</Card>
		</>
	);
}
