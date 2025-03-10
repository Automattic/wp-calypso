import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';

const NotFoundSiteSubscriptions = () => {
	const translate = useTranslate();
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const readFeedSearch = Reader.useUnsubscribedFeedsSearch();

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
			{ ( readFeedSearch?.feedItems.length ?? 0 ) > 0 &&
				translate( 'Here are some other sites related to your search.' ) }
		</div>
	);
};

export default NotFoundSiteSubscriptions;
