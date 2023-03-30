import { SubscriptionManager } from '@automattic/data-stores';
import SiteList from '../site-list/site-list';
import type { SiteSubscription } from '@automattic/data-stores/src/reader/types';

type useSiteSubscriptionsQueryResponse = {
	data: SiteSubscription[];
};

export default function SitesView() {
	const { data: sites } =
		SubscriptionManager.useSiteSubscriptionsQuery() as useSiteSubscriptionsQueryResponse;

	return <SiteList sites={ sites } />;
}
