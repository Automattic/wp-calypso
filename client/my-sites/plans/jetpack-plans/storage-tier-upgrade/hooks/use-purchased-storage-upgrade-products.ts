import { isJetpackSecuritySlug } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getPurchasedStorageSubscriptions from 'calypso/my-sites/plans/jetpack-plans/get-purchased-storage-subscriptions';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useGetProductCardData from './use-get-product-card-data';

const usePurchasedStorageUpgradeProducts = ( siteId: number ): SelectorProduct[] => {
	const purchasedStorageSlugs = useSelector( ( state ) =>
		getPurchasedStorageSubscriptions( state, siteId )
	).map( ( { productSlug } ) => productSlug );

	// Currently we only allow for one storage-aware purchase per site;
	// if we detect a Security purchase, pick that one;
	// otherwise, just use the first available purchase.
	const mostImportantSlug =
		purchasedStorageSlugs.find( isJetpackSecuritySlug ) ?? purchasedStorageSlugs?.[ 0 ];

	const getProductCardData = useGetProductCardData();

	return useMemo( () => {
		if ( ! mostImportantSlug ) {
			return [];
		}

		const data = getProductCardData( mostImportantSlug, true ) as SelectorProduct;

		return data ? [ data ] : [];
	}, [ mostImportantSlug, getProductCardData ] );
};

export default usePurchasedStorageUpgradeProducts;
