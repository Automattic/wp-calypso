import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { SITE_PURCHASES_UPDATE } from 'calypso/state/action-types';
import type { RawSiteProduct } from 'calypso/state/sites/selectors/get-site-products';

const formatPurchasesToSiteProducts = (
	purchases: Record< string, string >[]
): RawSiteProduct[] => {
	return purchases.map( ( purchase ) => ( {
		product_id: purchase.product_id,
		product_slug: purchase.product_slug,
		product_name: purchase.product_name,
		// `product_name_short`, `expired`, and `user_is_owner` are not available in the purchase object.
		product_name_short: purchase.product_name_short || null,
		expired: !! purchase.expired,
		user_is_owner: !! purchase.user_is_owner,
	} ) );
};

/**
 * Update site products in the Redux store by fetching purchases via API for Odyssey Stats.
 */
export default function usePurchasesToUpdateSiteProducts(
	isOdysseyStats: boolean | undefined,
	siteId: number | null
) {
	const reduxDispatch = useDispatch();

	const [ hasLoadedPurchases, setHasLoadedPurchases ] = useState< boolean | undefined >(
		! isOdysseyStats
	);
	const [ error, setError ] = useState< Error | null >( null );

	useEffect( () => {
		if ( isOdysseyStats ) {
			wpcom.req
				.get( { path: '/site/purchases', apiNamespace: 'jetpack/v4' } )
				.then( ( res: { data: string } ) => JSON.parse( res.data ) )
				.then( ( purchases: Record< string, string >[] ) => {
					reduxDispatch( {
						type: SITE_PURCHASES_UPDATE,
						siteId,
						purchases: formatPurchasesToSiteProducts( purchases ),
					} );
				} )
				.catch( ( error: Error ) => setError( error ) )
				.finally( () => setHasLoadedPurchases( true ) );
		}
	}, [ isOdysseyStats, reduxDispatch, siteId ] );

	return {
		hasLoadedPurchases,
		error,
	};
}
