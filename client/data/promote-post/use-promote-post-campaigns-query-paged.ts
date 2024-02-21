import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { requestDSP } from 'calypso/lib/promote-post';
import { SearchOptions } from 'calypso/my-sites/promote-post-i2/components/search-bar';
import { CampaignQueryResult } from './types';

type CampaignQueryOptions = {
	page?: number;
};

const getSearchOptionsQueryParams = ( searchOptions: SearchOptions ) => {
	let searchQueryParams = '';

	if ( searchOptions.search ) {
		searchQueryParams += `&title=${ searchOptions.search }`;
	}
	if ( searchOptions.filter ) {
		if ( searchOptions.filter.status && searchOptions.filter.status !== 'all' ) {
			searchQueryParams += `&status=${ searchOptions.filter.status }`;
		}
	}

	if ( searchOptions.order ) {
		searchQueryParams += `&order=${ searchOptions.order.order }&order_by=${ searchOptions.order.orderBy }`;
	}

	return searchQueryParams;
};

const useCampaignsQueryPaged = (
	siteId: number,
	searchOptions: SearchOptions,
	queryOptions: CampaignQueryOptions = {}
) => {
	const searchQueryParams = getSearchOptionsQueryParams( searchOptions );

	return useInfiniteQuery( {
		queryKey: [ 'promote-post-campaigns', siteId, searchQueryParams ],
		queryFn: async ( { pageParam = 1 } ) => {
			const searchCampaignsUrl = `/search/campaigns/site/${ siteId }?page=${ pageParam }${ searchQueryParams }`;
			const resultQuery = await requestDSP< CampaignQueryResult >( siteId, searchCampaignsUrl );
			const { campaigns, page, total_items, total_pages } = resultQuery;
			const has_more_pages = page < total_pages;

			return {
				campaigns,
				has_more_pages,
				total_items,
				total_pages,
				page,
			};
		},
		...queryOptions,
		enabled: !! siteId,
		retryDelay: 3000,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
		meta: {
			persist: false,
		},
		initialPageParam: 1,
		getNextPageParam: ( lastPage ) => {
			if ( lastPage.has_more_pages ) {
				return lastPage.page + 1;
			}
			return undefined;
		},
	} );
};

export default useCampaignsQueryPaged;
