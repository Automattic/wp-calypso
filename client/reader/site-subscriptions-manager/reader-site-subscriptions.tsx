import page from '@automattic/calypso-router';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { UnsubscribedFeedsSearchList } from 'calypso/blocks/reader-unsubscribed-feeds-search-list';
import {
	SiteSubscriptionsList,
	SiteSubscriptionsListActionsBar,
} from 'calypso/landing/subscriptions/components/site-subscriptions-list';
import { getUrlQuerySearchTerm } from 'calypso/landing/subscriptions/helpers';
import {
	useRecordSearchPerformed,
	useRecordSearchByUrlPerformed,
} from 'calypso/landing/subscriptions/tracks';
import { resemblesUrl } from 'calypso/lib/url';
import { RecommendedSites } from '../recommended-sites';
import NotFoundSiteSubscriptions from './not-found-site-subscriptions';

const SEARCH_KEY = 's';

const setUrlQuery = ( key: string, value: string ) => {
	const path = window.location.pathname + window.location.search;
	const nextPath = ! value
		? removeQueryArgs( path, key )
		: addQueryArgs( path, { [ key ]: value } );

	// Only trigger a page show when path has changed.
	if ( nextPath !== path ) {
		page.show( nextPath );
	}
};

const initialUrlQuerySearchTerm = getUrlQuerySearchTerm();

const ReaderSiteSubscriptions = () => {
	const translate = useTranslate();
	const { searchTerm, setSearchTerm } = SubscriptionManager.useSiteSubscriptionsQueryProps();
	const siteSubscriptionsQuery = SubscriptionManager.useSiteSubscriptionsQuery();
	const unsubscribedFeedsSearch = Reader.useUnsubscribedFeedsSearch();

	const hasSomeSubscriptions = siteSubscriptionsQuery.data.subscriptions.length > 0;
	const hasSomeUnsubscribedSearchResults = ( unsubscribedFeedsSearch?.feedItems.length ?? 0 ) > 0;

	const recordSearchPerformed = useRecordSearchPerformed();
	const recordSearchByUrlPerformed = useRecordSearchByUrlPerformed();

	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 600 );

	// Takes the ?s= url query search term and set it to the subscriptions query.
	useEffect( () => {
		if ( initialUrlQuerySearchTerm ) {
			setSearchTerm( initialUrlQuerySearchTerm as string );
		}
		// This should only run once
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Update url query when search term changes
	useEffect( () => {
		setUrlQuery( SEARCH_KEY, debouncedSearchTerm );
	}, [ debouncedSearchTerm ] );

	useEffect( () => {
		if ( debouncedSearchTerm ) {
			recordSearchPerformed( { query: debouncedSearchTerm } );
			if ( resemblesUrl( debouncedSearchTerm ) ) {
				recordSearchByUrlPerformed( { url: debouncedSearchTerm } );
			}
		}
	}, [ debouncedSearchTerm, recordSearchPerformed, recordSearchByUrlPerformed ] );

	return (
		<>
			<SiteSubscriptionsListActionsBar />
			<SiteSubscriptionsList notFoundComponent={ NotFoundSiteSubscriptions } />
			{ ! searchTerm && <RecommendedSites /> }

			{ hasSomeSubscriptions && hasSomeUnsubscribedSearchResults ? (
				<div className="site-subscriptions__search-recommendations-label">
					{ translate( 'Here are some other sites that match your search.' ) }
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
