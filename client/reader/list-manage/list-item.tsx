/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { Item } from './types';
import FeedItem from './feed-item';
import SiteItem from './site-item';
import TagItem from './tag-item';

export default function ListItem( props: {
	hideIfInList: boolean;
	item: Item;
	owner: string;
	list: any;
} ) {
	const { hideIfInList, item, owner, list } = props;
	if ( item.feed_ID ) {
		return <FeedItem hideIfInList={ hideIfInList } item={ item } owner={ owner } list={ list } />;
	} else if ( item.site_ID ) {
		return <SiteItem hideIfInList={ hideIfInList } item={ item } owner={ owner } list={ list } />;
	} else if ( item.tag_ID ) {
		return <TagItem hideIfInList={ hideIfInList } item={ item } owner={ owner } list={ list } />;
	}
	return null;
}
