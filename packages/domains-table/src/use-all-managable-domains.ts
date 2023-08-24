import {
	useAllDomainsQuery,
	type AllDomainsQueryFnData,
	type AllDomainsQueryParams,
} from '@automattic/data-stores';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { UseQueryOptions } from '@tanstack/react-query';

const EMPTY_STATE = Object.freeze( {} );

export function useAllManagableDomains(
	params: AllDomainsQueryParams = {},
	queryOptions: UseQueryOptions< AllDomainsQueryFnData > = {}
) {
	const { capabilities, sites } = useSelector( ( state: any ) => ( {
		capabilities: state?.currentUser?.capabilities || EMPTY_STATE,
		sites: state?.sites?.items || EMPTY_STATE,
	} ) );

	const { data: allDomains, ...queryResult } = useAllDomainsQuery( params, queryOptions );

	const filteredDomains = useMemo( () => {
		const sitesUserCanManage = new Set(
			Object.keys( sites ).filter(
				( siteId ) => capabilities[ siteId ]?.[ 'manage_options' ] || false
			)
		);

		return allDomains?.domains.filter(
			( domain ) =>
				domain.type !== 'wpcom' && sitesUserCanManage.has( domain.blog_id.toString( 10 ) )
		);
	}, [ allDomains, capabilities, sites ] );

	return { ...queryResult, data: filteredDomains };
}
