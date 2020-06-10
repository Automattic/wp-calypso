/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { Item } from './types';
import FeedItem from './feed-item';
import SiteItem from './site-item';
import TagItem from './tag-item';
import {
	deleteReaderListFeed,
	deleteReaderListSite,
	deleteReaderListTag,
} from 'state/reader/lists/actions';

export default function ListItem( props: { item: Item; owner: string; listSlug: string } ) {
	const { item, owner, listSlug } = props;
	const dispatch = useDispatch();
	return (
		<Card className="list-manage__site-card">
			{ item.feed_ID !== null && (
				<FeedItem
					item={ item }
					onRemove={ () => dispatch( deleteReaderListFeed( owner, listSlug, item.feed_ID ) ) }
				/>
			) }
			{ item.site_ID !== null && (
				<SiteItem
					item={ item }
					onRemove={ () => dispatch( deleteReaderListSite( owner, listSlug, item.site_ID ) ) }
				/>
			) }
			{ item.tag_ID !== null && (
				<TagItem
					item={ item }
					onRemove={ () =>
						dispatch( deleteReaderListTag( owner, listSlug, item.meta.data?.tag?.tag.slug ) )
					}
				/>
			) }
		</Card>
	);
}
