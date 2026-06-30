import { readFeedSearchQuery } from '@automattic/api-queries';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useMemo, type JSX } from 'react';

const { useSiteSubscriptionsQuery, useSiteSubscriptionsQueryProps } = SubscriptionManager;

const NotFoundSiteSubscriptions = (): JSX.Element => {
	const translate = useTranslate();
	const { searchTerm } = useSiteSubscriptionsQueryProps();
	const {
		data: { subscriptions },
	} = useSiteSubscriptionsQuery();
	const { data } = useQuery(
		readFeedSearchQuery( {
			query: searchTerm,
			excludeFollowed: true,
		} )
	);

	const filteredUnsubscribedFeedItems = useMemo(
		() =>
			( data?.feeds ?? [] ).filter( ( feedItem: Reader.FeedItem ): boolean => {
				const isDuplicate = subscriptions.find(
					( subscription ): boolean =>
						! subscription.isDeleted &&
						( subscription.feed_ID === feedItem.feed_ID ||
							subscription.URL === feedItem.subscribe_URL )
				);
				return ! isDuplicate;
			} ),
		[ data?.feeds, subscriptions ]
	);

	function getFeedSearchMessage( feedItemsCount: number ): string {
		if ( feedItemsCount === 1 ) {
			return translate( 'Here is one result related to your search.' );
		}

		if ( feedItemsCount > 1 ) {
			return translate( 'Here are some other sites related to your search.' );
		}

		return '';
	}

	return (
		<div className="not-found-site-subscriptions">
			{ searchTerm && searchTerm.length
				? translate( "You're not subscribed to any matching sites.", {
						comment:
							"When users type something into the search field of their site subscriptions manager in Reader, they'll see this message if their search doesn't find any of the websites they're currently subscribed to.",
				  } )
				: translate( 'No results found.', {
						comment:
							"When users type something into the search field of their site subscriptions manager in Reader, they'll see this message if their search doesn't find any of the websites they're currently subscribed to.",
				  } ) }{ ' ' }
			{ getFeedSearchMessage( filteredUnsubscribedFeedItems.length ) }
		</div>
	);
};

export default NotFoundSiteSubscriptions;
