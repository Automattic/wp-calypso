import { useMemo } from 'react';
import useFetchActiveSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-active-sites';

export type ConnectedSite = {
	id: number;
	url: string;
	features?: {
		wpcom_atomic?: {
			state?: string;
		};
	};
};

type Args = {
	search?: string;
	/** Maximum sites to return when `search` is empty. Ignored when `search` has a value. */
	limit?: number;
};

type Result = {
	sites: ConnectedSite[];
	isLoading: boolean;
	hasAnyConnectedSites: boolean;
};

export default function useConnectedSites( { search = '', limit }: Args = {} ): Result {
	const { data, isLoading } = useFetchActiveSites( { autoRefresh: false } );

	const allSites = useMemo< ConnectedSite[] >( () => {
		const list = Array.isArray( data ) ? ( data as ConnectedSite[] ) : [];
		return list
			.filter( ( site ) => {
				// Defensive runtime check: the API response is cast above but not
				// validated. If a malformed site ever comes through with a
				// non-string url, downstream consumers (e.g. site.url.toLowerCase()
				// in the search filter) would throw on a normal-looking dropdown.
				if ( typeof site.url !== 'string' || ! site.url ) {
					return false;
				}
				const state = site.features?.wpcom_atomic?.state;
				return state === undefined || state === 'active';
			} )
			.sort( ( a, b ) => b.id - a.id );
	}, [ data ] );

	const sites = useMemo< ConnectedSite[] >( () => {
		const query = search.trim().toLowerCase();
		if ( query ) {
			return allSites.filter( ( site ) => site.url.toLowerCase().includes( query ) );
		}
		if ( limit !== undefined ) {
			return allSites.slice( 0, limit );
		}
		return allSites;
	}, [ allSites, search, limit ] );

	return {
		sites,
		isLoading,
		hasAnyConnectedSites: allSites.length > 0,
	};
}
