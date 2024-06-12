import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { MEMBERSHIPS_PRODUCTS_RECEIVE } from 'calypso/state/action-types';
import { membershipProductFromApi } from 'calypso/state/data-layer/wpcom/sites/memberships';
import 'calypso/state/memberships/init';
import { SiteId } from 'calypso/types';
import { getApiPath } from '../lib/get-api';

function queryMemberships( siteId: SiteId ) {
	return wpcom.req
		.get(
			{
				path: getApiPath( '/memberships/products', { siteId } ),
				apiNamespace: 'wpcom/v2',
				isLocalApiCall: true,
			},
			{ type: 'all', is_editable: true }
		)
		.catch( () => ( { products: [] } ) );
}

function useQueryMemberships( siteId: SiteId ) {
	return useQuery( {
		...getDefaultQueryParams< { products: Array< object > } >(),
		queryKey: [ 'odyssey-stats', 'memberships', 'products', siteId ],
		queryFn: () => queryMemberships( siteId ),
		select: ( data ) => data?.products.map( membershipProductFromApi ),
	} );
}

/**
 *
 * @param {Object} props 			The list of component props.
 * @param {string} [props.siteId] 	The id of site to request
 * @returns {null} 					No visible output.
 */
export default function OdysseyQueryMemberships( { siteId }: { siteId: SiteId } ) {
	const { isFetching, data: products, isError: hasOtherErrors } = useQueryMemberships( siteId );
	const reduxDispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		if ( isFetching ) {
			return;
		}

		reduxDispatch( {
			type: MEMBERSHIPS_PRODUCTS_RECEIVE,
			siteId,
			products,
		} );
	}, [ reduxDispatch, siteId, products, hasOtherErrors, isFetching ] );

	return null;
}
