import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import { SiteList } from 'calypso/landing/subscriptions/components/site-list';
import TabView from '../tab-view';

const Sites = () => {
	const translate = useTranslate();
	const { data: sites, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery();

	// todo: translate when we have agreed on the error message
	const errorMessage = error ? 'An error occurred while fetching your subscriptions.' : '';

	if ( ! isLoading && ( ! sites || ! sites.length ) ) {
		return <Notice type="warning">{ translate( 'You are not subscribed to any sites.' ) }</Notice>;
	}

	return (
		<TabView errorMessage={ errorMessage } isLoading={ isLoading }>
			<SiteList sites={ sites } />
		</TabView>
	);
};

export default Sites;
