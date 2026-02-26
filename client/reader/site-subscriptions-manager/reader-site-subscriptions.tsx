import { SubscriptionManager } from '@automattic/data-stores';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect } from 'react';
import { UnsubscribedFeedsSearchList } from 'calypso/blocks/reader-unsubscribed-feeds-search-list';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import {
	useRecordSearchPerformed,
	useRecordSearchByUrlPerformed,
} from 'calypso/landing/subscriptions/tracks';
import { resemblesUrl } from 'calypso/lib/url';
import { RecommendedSites } from '../recommended-sites';
import { getUrlQuerySearchTerm, SEARCH_QUERY_PARAM, setUrlQuery } from '../utils';
const { useSiteSubscriptionsQueryProps } = SubscriptionManager;

const ReaderSiteSubscriptions = () => {
	const { searchTerm } = useSiteSubscriptionsQueryProps();
	const recordSearchPerformed = useRecordSearchPerformed();
	const recordSearchByUrlPerformed = useRecordSearchByUrlPerformed();

	// Update url query when search term changes
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
		<VStack spacing={ 6 }>
			<SiteSubscriptionsListActionsBar />
			<SiteSubscriptionsList />
			<UnsubscribedFeedsSearchList />
			<RecommendedSites />
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
