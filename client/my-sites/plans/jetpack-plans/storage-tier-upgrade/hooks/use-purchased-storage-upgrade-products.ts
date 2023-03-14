import { isJetpackSecuritySlug } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getPurchasedStorageSubscriptions from 'calypso/my-sites/plans/jetpack-plans/get-purchased-storage-subscriptions';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useGetStorageUpgradeProducts from './use-get-storage-upgrade-products';

const usePurchasedStorageUpgradeProducts = ( siteId: number ): SelectorProduct[] => {
	const purchasedStorageSlugs = useSelector( ( state ) =>
		getPurchasedStorageSubscriptions( state, siteId )
	).map( ( { productSlug } ) => productSlug );

	// Currently we only allow for one storage-aware purchase per site;
	// if we detect a Security purchase, pick that one;
	// otherwise, just use the first available purchase.
	const mostImportantSlug =
		purchasedStorageSlugs.find( isJetpackSecuritySlug ) ?? purchasedStorageSlugs?.[ 0 ];

	const getStorageUpgradeProducts = useGetStorageUpgradeProducts();

	return useMemo( () => {
		if ( ! mostImportantSlug ) {
			return [];
		}

		return [ ...( getStorageUpgradeProducts( mostImportantSlug ) as SelectorProduct[] ) ];
	}, [ mostImportantSlug, getStorageUpgradeProducts ] );
};

export default usePurchasedStorageUpgradeProducts;
