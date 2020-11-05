/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Dialog } from '@automattic/components';
import { Item } from './types';
import FeedItem from './feed-item';
import SiteItem from './site-item';
import TagItem from './tag-item';
import {
	deleteReaderListFeed,
	deleteReaderListSite,
	deleteReaderListTag,
} from 'calypso/state/reader/lists/actions';

export default function ListItem( props: { item: Item; owner: string; list: any } ) {
	const { item, owner, list } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ deleteState, setDeleteState ] = React.useState( '' );

	let deleteAction;

	if ( item.feed_ID ) {
		deleteAction = deleteReaderListFeed( list.ID, owner, list.slug, item.feed_ID );
	} else if ( item.site_ID ) {
		deleteAction = deleteReaderListSite( list.ID, owner, list.slug, item.site_ID );
	} else {
		deleteAction = deleteReaderListTag(
			list.ID,
			owner,
			list.slug,
			item.tag_ID,
			item.meta?.data?.tag?.tag.slug
		);
	}

	return (
		<>
			{ deleteState === '' && (
				<Card className="list-manage__site-card">
					{ item.feed_ID && (
						<FeedItem item={ item } onRemove={ () => setDeleteState( 'confirming' ) } />
					) }
					{ item.site_ID && (
						<SiteItem item={ item } onRemove={ () => setDeleteState( 'confirming' ) } />
					) }
					{ item.tag_ID && (
						<TagItem item={ item } onRemove={ () => setDeleteState( 'confirming' ) } />
					) }
				</Card>
			) }
			{ deleteState === 'confirming' && (
				<Dialog
					isVisible={ true }
					buttons={ [
						{ action: 'cancel', label: translate( 'Cancel' ) },
						{ action: 'delete', label: translate( 'Remove' ), isPrimary: true },
					] }
					onClose={ ( action ) => {
						if ( action === 'delete' ) {
							return [ dispatch( deleteAction ), setDeleteState( 'deleted' ) ];
						}

						setDeleteState( '' );
					} }
				>
					<h1>{ translate( 'Are you sure you want to remove this item?' ) }</h1>
					<p>{ translate( 'This action cannot be undone.' ) }</p>
				</Dialog>
			) }
		</>
	);
}
