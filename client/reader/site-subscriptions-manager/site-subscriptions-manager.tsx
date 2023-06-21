import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import {
	SiteSubscriptionsManager as ExternalSiteSubscriptionsManager,
	SiteSubscriptionsManagerProvider,
} from 'calypso/landing/subscriptions/components/site-subscriptions-manager';
import {
	ReaderPortal,
	SubscriptionManagerContextProvider,
} from 'calypso/landing/subscriptions/components/subscription-manager-context';
import { RecommendedSites } from 'calypso/reader/recommended-sites';
import { useDispatch } from 'calypso/state';
import { markFollowsAsStale } from 'calypso/state/reader/follows/actions';
import type { SubscriptionManagerContext } from 'calypso/landing/subscriptions/components/subscription-manager-context';
import './style.scss';

const useMarkFollowsAsStaleOnUnmount = () => {
	const dispatch = useDispatch();
	useEffect( () => {
		return () => {
			dispatch( markFollowsAsStale() );
		};
	}, [] );
};

const SiteSubscriptionsManager = () => {
	const translate = useTranslate();
	const context: SubscriptionManagerContext = {
		portal: ReaderPortal,
	};

	useMarkFollowsAsStaleOnUnmount();

	return (
		<SubscriptionManagerContextProvider { ...context }>
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
						<ExternalSiteSubscriptionsManager.List />
					</ExternalSiteSubscriptionsManager>
				</SiteSubscriptionsManagerProvider>
			</Main>
		</SubscriptionManagerContextProvider>
	);
};

export default SiteSubscriptionsManager;
