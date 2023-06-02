import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { SiteSubscriptionsManager } from 'calypso/landing/subscriptions/components/site-subscriptions-manager';
import './styles.scss';
import { SiteSubscriptionsManagerProvider } from 'calypso/landing/subscriptions/components/site-subscriptions-manager/site-subscriptions-manager-context';

const SubscriptionManager = () => {
	const translate = useTranslate();
	return (
		<Main className="reader-subscription-manager">
			{ /* todo: translate document title */ }
			<DocumentHead title="Site subscriptions" />
			<FormattedHeader
				headerText={ translate( 'Manage subscribed sites' ) }
				subHeaderText={ translate( 'Manage your newsletter and blog subscriptions.' ) }
				align="left"
			/>
			<SiteSubscriptionsManagerProvider>
				<SiteSubscriptionsManager>
					<SiteSubscriptionsManager.ListActionsBar />
					<SiteSubscriptionsManager.List onSiteTitleClick={ () => undefined } />
				</SiteSubscriptionsManager>
			</SiteSubscriptionsManagerProvider>
		</Main>
	);
};

export default SubscriptionManager;
