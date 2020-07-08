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

export default function ListItem( props: { item: Item; owner: string; list: any } ) {
	const { item, owner, list } = props;
	const dispatch = useDispatch();
	return (
		<Card className="list-manage__site-card">
			{ item.feed_ID && (
				<FeedItem
					item={ item }
					onRemove={ () =>
						dispatch( deleteReaderListFeed( list.ID, owner, list.slug, item.feed_ID ) )
					}
				/>
			) }
			{ item.site_ID && (
				<SiteItem
					item={ item }
					onRemove={ () =>
						dispatch( deleteReaderListSite( list.ID, owner, list.slug, item.site_ID ) )
					}
				/>
			) }
			{ item.tag_ID && (
				<TagItem
					item={ item }
					onRemove={ () =>
						dispatch(
							deleteReaderListTag(
								list.ID,
								owner,
								list.slug,
								item.tag_ID,
								item.meta?.data?.tag?.tag.slug
							)
						)
					}
				/>
			) }
		</Card>
	);
}
