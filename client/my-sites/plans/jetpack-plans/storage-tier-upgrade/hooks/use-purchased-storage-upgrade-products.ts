import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import getPurchasedStorageSubscriptions from 'calypso/my-sites/plans/jetpack-plans/get-purchased-storage-subscriptions';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useGetProductCardData from './use-get-product-card-data';

const usePurchasedStorageUpgradeProducts = ( siteId: number ): SelectorProduct[] => {
	const purchasedStorageSlugs = useSelector( ( state ) =>
		getPurchasedStorageSubscriptions( state, siteId )
	).map( ( { productSlug } ) => productSlug );
	const getProductCardData = useGetProductCardData();

	return useMemo(
		() =>
			purchasedStorageSlugs.map( ( slug ) => getProductCardData( slug, true ) as SelectorProduct ),
		[ purchasedStorageSlugs, getProductCardData ]
	);
};

export default usePurchasedStorageUpgradeProducts;
