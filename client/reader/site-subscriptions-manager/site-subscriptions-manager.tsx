import { useTranslate } from 'i18n-calypso';
import { AddSitesButton } from 'calypso/landing/subscriptions/components/add-sites-button';
import ReaderSiteSubscriptions from './reader-site-subscriptions';
import SubscriptionsManagerWrapper from './subscriptions-manager-wrapper';
import './style.scss';

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();

	return (
		<SubscriptionsManagerWrapper
			actionButton={ <AddSitesButton /> }
			headerText={ translate( 'Manage subscribed sites' ) }
			subHeaderText={ translate( 'Manage your site, RSS, and newsletter subscriptions.' ) }
		>
			<ReaderSiteSubscriptions />
		</SubscriptionsManagerWrapper>
	);
};

export default SiteSubscriptionsManager;
