import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { UnsubscribedFeedsSearchList } from 'calypso/blocks/reader-unsubscribed-feeds-search-list';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import { RecommendedSites } from '../recommended-sites';
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const ReaderSiteSubscriptions = () => {
	const translate = useTranslate();
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const siteSubscriptionsQuery = SubscriptionManager.useSiteSubscriptionsQuery();
	const unsubscribedFeedsSearch = Reader.useUnsubscribedFeedsSearch();

	const hasSomeSubscriptions = siteSubscriptionsQuery.data.subscriptions.length > 0;
	const hasSomeUnsubscribedSearchResults = ( unsubscribedFeedsSearch?.feedItems.length ?? 0 ) > 0;

	return (
		<>
			<SiteSubscriptionsListActionsBar />
			{ ! searchTerm && <RecommendedSites /> }
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />

			{ hasSomeSubscriptions && hasSomeUnsubscribedSearchResults ? (
				<div className="site-subscriptions__search-recommendations-label">
					{ translate( 'Here are some other sites that match your search.' ) }
				</div>
			) : null }
			<UnsubscribedFeedsSearchList />
		</>
	);
};

export default () => {
	return (
		<SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
			<Reader.UnsubscribedFeedsSearchProvider>
				<ReaderSiteSubscriptions />
			</Reader.UnsubscribedFeedsSearchProvider>
		</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
	);
};
