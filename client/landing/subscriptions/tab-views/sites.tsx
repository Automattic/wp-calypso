import { SubscriptionManager } from '@automattic/data-stores';
import SiteList from '../site-list/site-list';

export default function SitesView() {
	const { data: sites } = SubscriptionManager.useSiteSubscriptionsQuery();

	return <SiteList sites={ sites } />;
}
