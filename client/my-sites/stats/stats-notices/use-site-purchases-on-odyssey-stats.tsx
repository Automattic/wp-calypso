import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { PURCHASES_SITE_FETCH_COMPLETED } from 'calypso/state/action-types';
import type { RawPurchase } from 'calypso/lib/purchases/types';

/**
 * Update site products in the Redux store by fetching purchases via API for Odyssey Stats.
 */
export default function useSitePurchasesOnOdysseyStats(
	isOdysseyStats: boolean | undefined,
	siteId: number | null
) {
	const reduxDispatch = useDispatch();

	const [ error, setError ] = useState< Error | null >( null );

	useEffect( () => {
		if ( isOdysseyStats ) {
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
				.catch( ( error: Error ) => setError( error ) );
		}
	}, [ isOdysseyStats, reduxDispatch, siteId ] );

	return {
		error,
	};
}
