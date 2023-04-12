import { Spinner } from '@automattic/components';
import { SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { Notice } from 'calypso/landing/subscriptions/components/notice';
import { SiteList } from 'calypso/landing/subscriptions/components/site-list';
import './styles.scss';

const UserSitesList = () => {
	const translate = useTranslate();
	const { data: sites, isLoading, error } = SubscriptionManager.useSiteSubscriptionsQuery();

	if ( error ) {
		// todo: translate when we have agreed on the error message
		return <Notice type="error">An error occurred while fetching your subscriptions.</Notice>;
	}

	if ( isLoading ) {
		return <Spinner />;
	}

	if ( ! sites?.length ) {
		return <Notice type="warning">{ translate( 'You are not subscribed to any sites.' ) }</Notice>;
	}

	return <SiteList sites={ sites } />;
};

export default UserSitesList;
