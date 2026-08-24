import { useMemo } from 'react';
import useFetchActiveSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-active-sites';

export interface ConnectableSite {
	id: number;
	url: string;
}

interface SiteApiShape {
	id: number;
	url?: string;
	features?: {
		wpcom_atomic?: {
			state?: string;
		};
	};
}

// The sites a user can amplify: connected sites with a usable URL that aren't
// mid-provision. Mirrors the filtering the agency sites list applies elsewhere.
export default function useConnectableSites(): { sites: ConnectableSite[]; isLoading: boolean } {
	const { data, isLoading } = useFetchActiveSites( { autoRefresh: false } );

	const sites = useMemo< ConnectableSite[] >( () => {
		const list: SiteApiShape[] = Array.isArray( data ) ? data : [];
		return list
			.filter( ( site ): site is SiteApiShape & { url: string } => {
				if ( typeof site.url !== 'string' || ! site.url ) {
					return false;
				}
				const state = site.features?.wpcom_atomic?.state;
				return state === undefined || state === 'active';
			} )
			.map( ( site ) => ( { id: site.id, url: site.url } ) )
			.sort( ( a, b ) => b.id - a.id );
	}, [ data ] );

	return { sites, isLoading };
}
