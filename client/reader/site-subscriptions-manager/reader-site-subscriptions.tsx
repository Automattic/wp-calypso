import page from '@automattic/calypso-router';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { addQueryArgs, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
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
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const SEARCH_KEY = 's';

function getUrlQuerySearchTerm(): string {
	const queryArgs = getQueryArgs( window.location.href );
	return ( queryArgs[ SEARCH_KEY ] as string ) ?? '';
}

const setUrlQuery = ( key: string, value: string ) => {
	const path = window.location.pathname + window.location.search;
	const nextPath = ! value
		? removeQueryArgs( path, key )
		: addQueryArgs( path, { [ key ]: value } );

	// Only trigger a page show when path has changed.
	if ( nextPath !== path ) {
		page.replace( nextPath );
	}
};

const ReaderSiteSubscriptions = () => {
	const translate = useTranslate();
	const { searchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const siteSubscriptionsQuery = SubscriptionManager.useSiteSubscriptionsQuery();
	const unsubscribedFeedsSearch = Reader.useUnsubscribedFeedsSearch();

	const hasSomeSubscriptions = siteSubscriptionsQuery.data.subscriptions.length > 0;
	const hasSomeUnsubscribedSearchResults = ( unsubscribedFeedsSearch?.feedItems.length ?? 0 ) > 0;

	const recordSearchPerformed = useRecordSearchPerformed();
	const recordSearchByUrlPerformed = useRecordSearchByUrlPerformed();

	// Update url query when search term changes
	useEffect( () => {
		setUrlQuery( SEARCH_KEY, searchTerm );
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
		<>
			<SiteSubscriptionsListActionsBar />
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />
			{ ! searchTerm && <RecommendedSites /> }

			{ hasSomeSubscriptions && hasSomeUnsubscribedSearchResults && (
				<div className="site-subscriptions__search-recommendations-label">
					{ translate( 'Here are some other sites that match your search.' ) }
				</div>
			) }
			<UnsubscribedFeedsSearchList />
		</>
	);
};

export default () => (
	<SubscriptionManager.SiteSubscriptionsQueryPropsProvider
		initialSearchTermState={
			getUrlQuerySearchTerm // Take the `?s=` url query param and set is as initial search term state.
		}
	>
		<Reader.UnsubscribedFeedsSearchProvider>
			<ReaderSiteSubscriptions />
		</Reader.UnsubscribedFeedsSearchProvider>
	</SubscriptionManager.SiteSubscriptionsQueryPropsProvider>
);
