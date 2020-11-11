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
import Gridicon from 'calypso/components/gridicon';
import {
	READER_LISTS_DELETE_STATE_CONFIRMING,
	READER_LISTS_DELETE_STATE_DELETED,
} from './constants';
import FeedTitle from './feed-title';
import SiteTitle from './site-title';
import TagTitle from './tag-title';

export default function ListItem( props: { item: Item; owner: string; list: any } ) {
	const { item, owner, list } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ deleteState, setDeleteState ] = React.useState( '' );

	let feed;
	let deleteAction;
	let itemTitle;
	let site;
	let tag;

	if ( item.feed_ID ) {
		deleteAction = deleteReaderListFeed( list.ID, owner, list.slug, item.feed_ID );
		feed = item.meta?.data?.feed;
		if ( feed ) {
			itemTitle = <FeedTitle feed={ feed } />;
		}
	} else if ( item.site_ID ) {
		deleteAction = deleteReaderListSite( list.ID, owner, list.slug, item.site_ID );
		site = item.meta?.data?.site;
		if ( site ) {
			itemTitle = <SiteTitle site={ site } />;
		}
	} else {
		deleteAction = deleteReaderListTag(
			list.ID,
			owner,
			list.slug,
			item.tag_ID,
			item.meta?.data?.tag?.tag.slug
		);
		tag = item.meta?.data?.tag;
		if ( tag ) {
			itemTitle = <TagTitle tag={ tag } />;
		}
	}

	return (
		<>
			{ deleteState === '' && (
				<Card className="list-manage__site-card">
					{ item.feed_ID && (
						<FeedItem
							item={ item }
							onRemove={ () => setDeleteState( READER_LISTS_DELETE_STATE_CONFIRMING ) }
						/>
					) }
					{ item.site_ID && (
						<SiteItem
							item={ item }
							onRemove={ () => setDeleteState( READER_LISTS_DELETE_STATE_CONFIRMING ) }
						/>
					) }
					{ item.tag_ID && (
						<TagItem
							item={ item }
							onRemove={ () => setDeleteState( READER_LISTS_DELETE_STATE_CONFIRMING ) }
						/>
					) }
				</Card>
			) }
			{ deleteState === READER_LISTS_DELETE_STATE_CONFIRMING && (
				<Dialog
					isVisible={ true }
					buttons={ [
						{ action: 'cancel', label: translate( 'Cancel' ) },
						{ action: 'delete', label: translate( 'Remove' ), isPrimary: true },
					] }
					onClose={ ( action ) => {
						if ( action === 'delete' ) {
							return [
								dispatch( deleteAction ),
								setDeleteState( READER_LISTS_DELETE_STATE_DELETED ),
							];
						}

						setDeleteState( '' );
					} }
				>
					<h1>{ translate( 'Are you sure you want to remove this item?' ) }</h1>
					{ itemTitle && (
						<p className="list-manage__dialog-item-title">
							<Gridicon
								className="list-manage__dialog-item-title-icon"
								icon={ tag ? 'tag' : 'globe' }
								size="16"
							/>
							<strong>{ itemTitle }</strong>
						</p>
					) }
					<p>{ translate( 'This action cannot be undone.' ) }</p>
				</Dialog>
			) }
		</>
	);
}
