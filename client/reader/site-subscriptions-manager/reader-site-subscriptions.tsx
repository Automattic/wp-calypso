import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useEffect } from 'react';
import { ReaderFeedSitesSearchList } from 'calypso/blocks/reader-feed-sites-search-list';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import { RecommendedSites } from '../recommended-sites';
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const ReaderSiteSubscriptions = () => {
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const siteSubscriptionsQuery = SubscriptionManager.useSiteSubscriptionsQuery();
	const readFeedSearch = Reader.useReadFeedSearch();

	useEffect( () => {
		readFeedSearch?.setSearchQuery( searchTerm );
	}, [ readFeedSearch, searchTerm ] );

	const hasSomeSubscriptions = siteSubscriptionsQuery.data.subscriptions.length > 0;
	const hasSomeFeedSearchResults = ( readFeedSearch?.feedItems.length ?? 0 ) > 0;

	return (
		<>
			<SiteSubscriptionsListActionsBar />
			{ ! searchTerm && <RecommendedSites /> }
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />

			{ hasSomeSubscriptions && hasSomeFeedSearchResults ? (
				<div className="site-subscriptions__search-recommendations-label">
					{
						'Other recommendations for you' // TODO: translate once we have the final string
					}
				</div>
			) : null }
			<ReaderFeedSitesSearchList />
		</>
	);
};

export default () => {
	return (
		<SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
			<Reader.ReadFeedSearchProvider>
				<ReaderSiteSubscriptions />
			</Reader.ReadFeedSearchProvider>
		</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
	);
};
