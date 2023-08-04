import { useInfiniteQuery } from '@tanstack/react-query';
import { requestDSP } from 'calypso/lib/promote-post';
import { SearchOptions } from 'calypso/my-sites/promote-post-i2/components/search-bar';
import { Campaign } from './types';
const DSP_ERROR_NO_LOCAL_USER = 'no_local_user';

type CampaignQueryResult = {
	campaigns: Campaign[];
	total_items: number;
	total_pages: number;
	page: number;
	has_more_pages: boolean;
};

type NewDSPUserResult = {
	new_dsp_user: boolean;
};

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

	return searchQueryParams;
};

async function getCampaigns( siteId: number, pageParam: number, searchQueryParams: string ) {
	const searchCampaignsUrl = `/search/campaigns/site/${ siteId }?order=asc&order_by=post_date&page=${ pageParam }${ searchQueryParams }`;
	try {
		return await requestDSP< CampaignQueryResult >( siteId, searchCampaignsUrl );
	} catch ( e ) {
		await handleDSPError( e, siteId, pageParam, searchQueryParams );
		throw new Error( 'Error while fetching campaigns' );
	}
}

async function handleDSPError(
	error: any,
	siteId: number,
	pageParam: number,
	searchQueryParams: string
) {
	if ( error.errorCode === DSP_ERROR_NO_LOCAL_USER ) {
		const createUserQuery = await requestDSP< NewDSPUserResult >( siteId, `/user/check` );
		if ( ! createUserQuery.new_dsp_user ) {
			// then we should retry the original query
			return await getCampaigns( siteId, pageParam, searchQueryParams );
		}
	}
	throw error;
}

const useCampaignsQueryPaged = (
	siteId: number,
	searchOptions: SearchOptions,
	queryOptions: CampaignQueryOptions = {}
) => {
	const searchQueryParams = getSearchOptionsQueryParams( searchOptions );

	return useInfiniteQuery(
		[ 'promote-post-campaigns', siteId, searchQueryParams ],
		async ( { pageParam = 1 } ) => {
			const resultQuery = await getCampaigns( siteId, pageParam, searchQueryParams );

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
		{
			...queryOptions,
			enabled: !! siteId,
			retryDelay: 3000,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
			meta: {
				persist: false,
			},
			getNextPageParam: ( lastPage ) => {
				if ( lastPage.has_more_pages ) {
					return lastPage.page + 1;
				}
				return undefined;
			},
		}
	);
};

export default useCampaignsQueryPaged;
