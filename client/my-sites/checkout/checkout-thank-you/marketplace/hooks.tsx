import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';

const PURCHASE_MARKETPLACE_PLUGIN_TYPE = 'marketplace_plugin';

export function usePluginSlugsOrIds( productSlug: string ) {
	const siteId = useSelector( getSelectedSiteId );
	const purchases = useSelector(
		( state ) => getSitePurchases( state, siteId ),
		( oldValue, newValue ) =>
			( oldValue.length === 0 && newValue.length === 0 ) || // if both are empty its considered the same
			oldValue?.[ 0 ]?.siteId === newValue?.[ 0 ]?.siteId // if both collections have the same site id, its the same
	);
	const [ productSlugsOrIds, setProductSlugsOrIds ] = useState< Array< string | number > >( [] );

	useEffect( () => {
		// If not "plugins", use the plugins slugs passed via URL
		if ( productSlug !== 'plugins' ) {
			return setProductSlugsOrIds( productSlug.split( ',' ) );
		}

		// Get the list of items of the last purchase
		const latestPurchases = purchases.reduce< Purchase[] >( ( lastPurchases, purchase ) => {
			// pick the first if the list is empty
			if ( ! lastPurchases.length ) {
				return [ purchase ];
			}

			// If the date is the same as the list, append the item to the list
			const [ currentLastPurchase ] = lastPurchases;
			if ( currentLastPurchase.subscribedDate === purchase.subscribedDate ) {
				lastPurchases.push( purchase );

				return lastPurchases;
			}

			// If the current purchase is newer than the current last, use it, otherwise keep the current lasts
			return new Date( purchase.subscribedDate ) > new Date( currentLastPurchase.subscribedDate )
				? [ purchase ]
				: lastPurchases;
		}, [] );

		// Use only Marketplace plugin purchases
		const marketplacePluginPurchases = latestPurchases.filter(
			( purchase ) => purchase.productType === PURCHASE_MARKETPLACE_PLUGIN_TYPE
		);

		setProductSlugsOrIds( marketplacePluginPurchases.map( ( purchase ) => purchase.productId ) );
	}, [ productSlug, purchases ] );

	return productSlugsOrIds;
}
