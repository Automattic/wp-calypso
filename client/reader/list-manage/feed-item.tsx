/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FollowButton from 'calypso/blocks/follow-button/button';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import Gridicon from 'calypso/components/gridicon';
import { Item, Feed, FeedError, List } from './types';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import { addReaderListFeed, deleteReaderListFeed } from 'calypso/state/reader/lists/actions';
import { getMatchingItem } from 'calypso/state/reader/lists/selectors';
import ItemRemoveDialog from './item-remove-dialog';

function isFeedError( feed: Feed | FeedError ): feed is FeedError {
	return 'errors' in feed;
}

function FeedTitle( { feed: { name, URL, feed_URL } }: { feed: Feed } ) {
	return <>{ name || URL || feed_URL }</>;
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
					<div className="list-item__title">
						<FeedTitle feed={ feed } />
					</div>
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
export default function FeedItem( props: {
	hideIfInList?: boolean;
	isFollowed?: boolean;
	item: Item;
	list: List;
	owner: string;
} ): React.ReactElement | null {
	const { list, owner, item } = props;
	const feed = useSelector( ( state ) => {
		let feed = props.item.meta?.data?.feed;
		if ( ! feed && props.item.feed_ID ) {
			feed = getFeed( state, props.item.feed_ID ) as Feed | undefined;
		}
		return feed;
	} );

	const isInList = !! useSelector( ( state ) =>
		getMatchingItem( state, { feedId: item.feed_ID, listId: list.ID } )
	);

	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = React.useState( false );
	const addItem = () => dispatch( addReaderListFeed( list.ID, owner, list.slug, item.feed_ID ) );
	const deleteItem = ( shouldDelete: boolean ) => {
		setShowDeleteConfirmation( false );
		shouldDelete && dispatch( deleteReaderListFeed( list.ID, owner, list.slug, item.feed_ID ) );
	};

	if ( isInList && props.hideIfInList ) {
		return null;
	}

	return ! feed ? (
		// TODO: Add support for removing invalid feed list item
		<Card className="list-manage__site-card">
			<SitePlaceholder />
			<QueryReaderFeed feedId={ item.feed_ID } />
		</Card>
	) : (
		<Card className="list-manage__site-card">
			{ isFeedError( feed ) ? renderFeedError( feed ) : renderFeed( feed ) }

			{ props.isFollowed && (
				<FollowButton followLabel={ translate( 'Following site' ) } following />
			) }

			{ ! isInList ? (
				<Button primary onClick={ addItem }>
					{ translate( 'Add' ) }
				</Button>
			) : (
				<Button primary onClick={ () => setShowDeleteConfirmation( true ) }>
					{ translate( 'Remove' ) }
				</Button>
			) }

			<ItemRemoveDialog
				onClose={ deleteItem }
				title={ <FeedTitle feed={ feed } /> }
				type="feed"
				visibility={ showDeleteConfirmation }
			/>
		</Card>
	);
}
