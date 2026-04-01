import { SubscriptionManager } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect } from 'react';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	useRecordSearchPerformed,
	useRecordSearchByUrlPerformed,
} from 'calypso/landing/subscriptions/tracks';
import { resemblesUrl } from 'calypso/lib/url';
import UnsubscribedFeedsSearchList from 'calypso/reader/site-subscriptions-manager/unsubscribed-feeds-search-list';
import { RecommendedSites } from '../recommended-sites';
import { getUrlQuerySearchTerm, SEARCH_QUERY_PARAM, setUrlQuery } from '../utils';
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const ReaderSiteSubscriptions = (): JSX.Element => {
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const recordSearchPerformed = useRecordSearchPerformed();
	const recordSearchByUrlPerformed = useRecordSearchByUrlPerformed();

	useEffect( () => {
		setUrlQuery( SEARCH_QUERY_PARAM, searchTerm );
	}, [ searchTerm ] );

	useEffect( () => {
		if ( searchTerm ) {
			recordSearchPerformed( { query: searchTerm } );
			if ( resemblesUrl( searchTerm ) ) {
				recordSearchByUrlPerformed( { url: searchTerm } );
			}
		}
	}, [ searchTerm, recordSearchPerformed, recordSearchByUrlPerformed ] );

	return (
		<VStack>
			<SiteSubscriptionsListActionsBar />
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />
			{ ! searchTerm && <RecommendedSites /> }
			<UnsubscribedFeedsSearchList hideTitle />
		</VStack>
	);
};

const ReaderSiteSubscriptionsWrapper = () => (
	<SubscriptionManager.SiteSubscriptionsQueryPropsProvider
		initialSearchTermState={
			getUrlQuerySearchTerm // Take the `?s=` url query param and set is as initial search term state.
		}
	>
		<ReaderSiteSubscriptions />
	</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
);

export default ReaderSiteSubscriptionsWrapper;
