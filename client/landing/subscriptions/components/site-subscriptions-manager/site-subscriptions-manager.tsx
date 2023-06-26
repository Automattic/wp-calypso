import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { Notice, NoticeType } from 'calypso/landing/subscriptions/components/notice';
import SiteSubscriptionsList from './site-subscriptions-list';
import ListActionsBar from './site-subscriptions-list-actions-bar';
import {
	SiteSubscriptionsManagerProvider,
	useSiteSubscriptionsManager,
} from './site-subscriptions-manager-context';
import './styles.scss';

type SiteSubscriptionsManagerProps = { children: React.ReactNode };

export const SiteSubscriptionsManager = ( { children }: SiteSubscriptionsManagerProps ) => {
	const translate = useTranslate();
	const { siteSubscriptionsQueryResult } = useSiteSubscriptionsManager();
	const { data, isLoading, error } = siteSubscriptionsQueryResult;
	const { totalCount } = data ?? {};

	if ( error ) {
		return (
			<Notice type={ NoticeType.Error }>
				{ translate(
					'We had a small hiccup loading your subscriptions. Please try refreshing the page.'
				) }
			</Notice>
		);
	}

	if ( isLoading ) {
		return (
			<div className="loading-container">
				<Spinner />
			</div>
		);
	}

	if ( ! isLoading && ! totalCount ) {
		return (
			<Notice type={ NoticeType.Warning }>
				{ translate( 'You are not subscribed to any sites.' ) }
			</Notice>
		);
	}

	return <div className="site-subscriptions-manager">{ children }</div>;
};

SiteSubscriptionsManager.ListActionsBar = ListActionsBar;
SiteSubscriptionsManager.List = SiteSubscriptionsList;

export default () => {
	return (
		<SiteSubscriptionsManagerProvider>
			<SiteSubscriptionsManager>
				<SiteSubscriptionsManager.ListActionsBar />
				<SiteSubscriptionsManager.List />
			</SiteSubscriptionsManager>
		</SiteSubscriptionsManagerProvider>
	);
};
