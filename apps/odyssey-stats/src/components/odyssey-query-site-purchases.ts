/**
 * This is a Odyssey implementation of 'calypso/components/data/query-site-purchases'.
 */
import { useQuery } from '@tanstack/react-query';
import { isError } from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import {
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
} from 'calypso/state/action-types';

async function queryOdysseyQuerySitePurchases( siteId: number | null ) {
	if ( ! siteId ) {
		return;
	}

	return wpcom.req
		.get( { path: '/site/purchases', apiNamespace: 'jetpack/v4' } )
		.then( ( res: { data: string } ) => JSON.parse( res.data ) )
		.catch( ( error: Error ) => error );
}
/**
 * Update site products in the Redux store by fetching purchases via API for Odyssey Stats.
 */

const useOdysseyQuerySitePurchases = ( siteId: number | null ) => {
	return useQuery( {
		queryKey: [ 'odyssey-stats', 'site-purchases', siteId ],
		queryFn: () => queryOdysseyQuerySitePurchases( siteId ),
		staleTime: 10 * 1000,
		// If the module is not active, we don't want to retry the query.
		retry: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
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
		if ( isFetching ) {
			return;
		}
		// Dispatch evet marking as requesting
		reduxDispatch( {
			type: PURCHASES_SITE_FETCH,
			siteId,
		} );
		if ( isError( purchases ) || hasOtherErrors ) {
			// Dispatch to the Purchases reducer for error status
			reduxDispatch( {
				type: PURCHASES_SITE_FETCH_FAILED,
				error: purchases.message,
			} );
		} else {
			// Dispatch to the Purchases reducer for consistent requesting status
			reduxDispatch( {
				type: PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: purchases,
			} );
		}
	}, [ purchases, isFetching, reduxDispatch, hasOtherErrors ] );

	return null;
}
