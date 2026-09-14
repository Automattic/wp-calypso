/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	addReadListFeedMutation,
	deleteReadListFeedMutation,
	readListItemsAllQuery,
} from '@automattic/api-queries';
import { Button, Card, Gridicon } from '@automattic/components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FollowButton from 'calypso/blocks/follow-button/button';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { removeTrailingSlash } from 'calypso/lib/string';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { DEFAULT_NOTICE_DURATION } from 'calypso/state/notices/constants';
import ItemRemoveDialog from './item-remove-dialog';
import { Item, Feed, FeedError, List } from './types';

function isFeedError( feed: Feed | FeedError ): feed is FeedError {
	return 'errors' in feed;
}

function FeedTitle( { feed: { name, URL, feed_URL } }: { feed: Feed } ) {
	return <>{ name || URL || feed_URL }</>;
}

function renderFeed( feed: Feed ) {
	return (
		<div className="feed-item list-item">
			<a className="list-item__content" href={ `/reader/feeds/${ feed.feed_ID }` }>
				<div className="list-item__icon">
					<SiteIcon iconUrl={ feed.image } />
				</div>

				<div className="list-item__info">
					<div className="list-item__title">
						<FeedTitle feed={ feed } />
					</div>
					<div className="list-item__domain">
						{ removeTrailingSlash( feed.URL ) || feed.feed_URL }
					</div>
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

export default function FeedItem( props: {
	hideIfInList?: boolean;
	isFollowed?: boolean;
	item: Item;
	list: List;
	owner: string;
	hideFollowButton?: boolean;
} ) {
	const { list, owner, item } = props;
	const { data: fetchedFeed } = useFeedQuery( props.item.feed_ID );
	const feed = ( props.item.meta?.data?.feed ?? fetchedFeed ) as Feed | undefined;
	const isRecommendedBlogsList = list.slug === 'recommended-blogs';

	const { data: isInList = false } = useQuery( {
		...readListItemsAllQuery( owner, list.slug ),
		select: ( itemsData ) =>
			!! item.feed_ID &&
			!! itemsData?.items?.some(
				( listItem ) => Number( listItem.feed_ID ) === Number( item.feed_ID )
			),
	} );

	const dispatch = useDispatch();
	const translate = useTranslate();
	const queryClient = useQueryClient();
	const { mutate: addFeed } = useMutation( addReadListFeedMutation( queryClient ) );
	const { mutate: deleteFeed } = useMutation( deleteReadListFeedMutation( queryClient ) );

	const [ showDeleteConfirmation, setShowDeleteConfirmation ] = useState( false );
	const addItem = () => {
		if ( ! item.feed_ID ) {
			return;
		}
		addFeed(
			{ owner, slug: list.slug, feedId: Number( item.feed_ID ) },
			{
				onSuccess: () => {
					dispatch(
						successNotice(
							isRecommendedBlogsList
								? translate( 'Recommendation successfully added.' )
								: translate( 'Feed added to list successfully.' ),
							{ duration: DEFAULT_NOTICE_DURATION }
						)
					);
				},
				onError: () => {
					dispatch(
						errorNotice(
							isRecommendedBlogsList
								? translate( 'Unable to add recommendation.' )
								: translate( 'Unable to add feed to list.' )
						)
					);
				},
			}
		);
	};
	const deleteItem = ( shouldDelete: boolean ) => {
		setShowDeleteConfirmation( false );
		if ( ! shouldDelete || ! item.feed_ID ) {
			return;
		}
		deleteFeed(
			{ owner, slug: list.slug, feedId: Number( item.feed_ID ) },
			{
				onSuccess: () => {
					dispatch(
						successNotice(
							isRecommendedBlogsList
								? translate( 'Recommendation successfully removed.' )
								: translate( 'Feed removed from list successfully.' ),
							{ duration: DEFAULT_NOTICE_DURATION }
						)
					);
				},
				onError: () => {
					dispatch(
						errorNotice(
							isRecommendedBlogsList
								? translate( 'Unable to remove recommendation.' )
								: translate( 'Unable to remove feed from list.' )
						)
					);
				},
			}
		);
	};

	if ( isInList && props.hideIfInList ) {
		return null;
	}

	return ! feed ? (
		// TODO: Add support for removing invalid feed list item
		<Card className="list-manage__site-card">
			<SitePlaceholder />
		</Card>
	) : (
		<Card className="list-manage__site-card">
			{ isFeedError( feed ) ? renderFeedError( feed ) : renderFeed( feed ) }

			{ props.isFollowed && ! props.hideFollowButton && (
				<FollowButton followLabel={ translate( 'Following site' ) } following />
			) }

			{ ! isInList ? (
				<Button primary onClick={ addItem }>
					{ isRecommendedBlogsList ? translate( 'Recommend' ) : translate( 'Add' ) }
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
