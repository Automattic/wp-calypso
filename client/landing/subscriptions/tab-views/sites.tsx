import { SubscriptionManager } from '@automattic/data-stores';
import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { Notice } from '../notice';
import SiteList from '../site-list/site-list';

export default function SitesView() {
	const translate = useTranslate();
	const { data: sites, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery();

	if ( error ) {
		// todo: translate when we have agreed on the error message
		return <Notice type="error">An error occurred while fetching your subscriptions.</Notice>;
	}

	if ( isLoading ) {
		return (
			<div className="user-settings">
				<Spinner />
			</div>
		);
	}

	if ( ! sites || ! sites.length ) {
		return <Notice type="warning">{ translate( 'You are not subscribed to any sites.' ) }</Notice>;
	}

	return <SiteList sites={ sites } />;
}
