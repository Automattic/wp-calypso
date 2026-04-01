import { readFeedSearchQuery } from '@automattic/api-queries';
import { SubscriptionManager } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';

const NotFoundSiteSubscriptions = (): JSX.Element => {
	const translate = useTranslate();
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const { data } = useQuery(
		readFeedSearchQuery( {
			query: searchTerm,
			excludeFollowed: true,
		} )
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
			{ getFeedSearchMessage( data?.feeds?.length ?? 0 ) }
		</div>
	);
};

export default NotFoundSiteSubscriptions;
