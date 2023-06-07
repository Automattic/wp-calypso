import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import {
	SiteSubscriptionsManager as ExternalSiteSubscriptionsManager,
	SiteSubscriptionsManagerProvider,
} from 'calypso/landing/subscriptions/components/site-subscriptions-manager';
import { RecommendedSites } from 'calypso/reader/recommended-sites';
import './style.scss';

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();
	return (
		<Main className="site-subscriptions-manager">
			{ /* todo: translate document title */ }
			<DocumentHead title="Site subscriptions" />
			<FormattedHeader
				headerText={ translate( 'Manage subscribed sites' ) }
				subHeaderText={ translate( 'Manage your newsletter and blog subscriptions.' ) }
				align="left"
			/>
			<SiteSubscriptionsManagerProvider>
				<ExternalSiteSubscriptionsManager>
					<ExternalSiteSubscriptionsManager.ListActionsBar />
					<RecommendedSites />
					<ExternalSiteSubscriptionsManager.List onSiteTitleClick={ () => undefined } />
				</ExternalSiteSubscriptionsManager>
			</SiteSubscriptionsManagerProvider>
		</Main>
	);
};

export default SiteSubscriptionsManager;
