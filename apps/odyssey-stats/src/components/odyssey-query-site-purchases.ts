/**
 * This is a Odyssey implementation of 'calypso/components/data/query-site-purchases'.
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import {
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
} from 'calypso/state/action-types';
import { isFetchingSitePurchases } from 'calypso/state/purchases/selectors';
import type { RawPurchase } from 'calypso/lib/purchases/types';

/**
 * Update site products in the Redux store by fetching purchases via API for Odyssey Stats.
 */
const useOdysseyQuerySitePurchases = ( siteId: number | null ) => {
	const isRequesting = useSelector( ( state ) => isFetchingSitePurchases( state ) );
	const reduxDispatch = useDispatch();

	useEffect( () => {
		if ( ! siteId || isRequesting ) {
			return;
		}

		// Dispatch evet marking as requesting
		reduxDispatch( {
			type: PURCHASES_SITE_FETCH,
			siteId,
		} );

		wpcom.req
			.get( { path: '/site/purchases', apiNamespace: 'jetpack/v4' } )
			.then( ( res: { data: string } ) => JSON.parse( res.data ) )
			.then( ( purchases: RawPurchase[] ) => {
				// Dispatch to the Purchases reducer for consistent requesting status
				reduxDispatch( {
					type: PURCHASES_SITE_FETCH_COMPLETED,
					siteId,
					purchases: purchases,
				} );
			} )
			.catch( ( error: Error ) => {
				// Dispatch to the Purchases reducer for error status
				reduxDispatch( {
					type: PURCHASES_SITE_FETCH_FAILED,
					error: error.message,
				} );
			} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ siteId, reduxDispatch ] );
};

export default function OdysseyQuerySitePurchases( { siteId }: { siteId: number | null } ) {
	useOdysseyQuerySitePurchases( siteId );

	return null;
}
