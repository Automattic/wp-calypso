import { SubscriptionManager } from '@automattic/data-stores';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import { RecommendedSites } from '../recommended-sites';
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const SiteSubscriptions = () => {
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	return (
		<>
			<SiteSubscriptionsListActionsBar />
			{ ! searchTerm && <RecommendedSites /> }
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />
		</>
	);
};

export default () => {
	return (
		<SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
			<SiteSubscriptions />
		</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
	);
};
