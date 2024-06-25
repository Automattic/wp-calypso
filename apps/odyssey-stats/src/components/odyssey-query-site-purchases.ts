/**
 * This is a Odyssey implementation of 'calypso/components/data/query-site-purchases'.
 */
import { APIError } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { isError } from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import {
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
} from 'calypso/state/action-types';
import { getApiNamespace, getApiPath } from '../lib/get-api';

async function queryOdysseyQuerySitePurchases( siteId: number | null ) {
	if ( ! siteId ) {
		return;
	}

	return wpcom.req
		.get( {
			path: getApiPath( '/site/purchases', { siteId } ),
			apiNamespace: getApiNamespace( 'my-jetpack/v1' ),
		} )
		.catch( ( error: APIError ) => error );
}
/**
 * Update site products in the Redux store by fetching purchases via API for Odyssey Stats.
 */

const useOdysseyQuerySitePurchases = ( siteId: number | null ) => {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'odyssey-stats', 'site-purchases', siteId ],
		queryFn: () => queryOdysseyQuerySitePurchases( siteId ),
		staleTime: 10 * 1000,
		// If the module is not active, we don't want to retry the query.
		retry: false,
	} );
};

export default function OdysseyQuerySitePurchases( { siteId }: { siteId: number | null } ) {
	const {
		data: purchases,
		isFetching,
		isError: hasOtherErrors,
	} = useOdysseyQuerySitePurchases( siteId );
	const reduxDispatch = useDispatch();

	useEffect( () => {
		// Dispatch evet marking as requesting
		reduxDispatch( {
			type: PURCHASES_SITE_FETCH,
			siteId,
		} );

		if ( isFetching ) {
			return;
		}

		if ( isError( purchases ) || hasOtherErrors ) {
			// Dispatch to the Purchases reducer for error status
			reduxDispatch( {
				type: PURCHASES_SITE_FETCH_FAILED,
				error: 'purchase_fetch_failed',
			} );
		} else {
			// Dispatch to the Purchases reducer for consistent requesting status
			reduxDispatch( {
				type: PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: purchases,
			} );
		}
	}, [ purchases, isFetching, reduxDispatch, hasOtherErrors, siteId ] );

	return null;
}
