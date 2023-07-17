import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
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
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const ReaderSiteSubscriptions = () => {
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const siteSubscriptionsQuery = SubscriptionManager.useSiteSubscriptionsQuery();
	const unsubscribedFeedsSearch = Reader.useUnsubscribedFeedsSearch();

	const hasSomeSubscriptions = siteSubscriptionsQuery.data.subscriptions.length > 0;
	const hasSomeUnsubscribedSearchResults = ( unsubscribedFeedsSearch?.feedItems.length ?? 0 ) > 0;

	const recordSearchPerformed = useRecordSearchPerformed();
	const recordSearchByUrlPerformed = useRecordSearchByUrlPerformed();

	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 1000 );

	useEffect( () => {
		if ( debouncedSearchTerm !== '' ) {
			recordSearchPerformed( { query: debouncedSearchTerm } );

			if ( resemblesUrl( debouncedSearchTerm ) ) {
				recordSearchByUrlPerformed( { url: debouncedSearchTerm } );
			}
		}
	}, [ debouncedSearchTerm, recordSearchPerformed, recordSearchByUrlPerformed ] );

	return (
		<>
			<SiteSubscriptionsListActionsBar />
			{ ! searchTerm && <RecommendedSites /> }
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />

			{ hasSomeSubscriptions && hasSomeUnsubscribedSearchResults ? (
				<div className="site-subscriptions__search-recommendations-label">
					{
						'Here are some other sites that match your search.' // TODO: translate once we have the final string
					}
				</div>
			) : null }
			<UnsubscribedFeedsSearchList />
		</>
	);
};

export default () => {
	return (
		<SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
			<Reader.UnsubscribedFeedsSearchProvider>
				<ReaderSiteSubscriptions />
			</Reader.UnsubscribedFeedsSearchProvider>
		</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
	);
};
