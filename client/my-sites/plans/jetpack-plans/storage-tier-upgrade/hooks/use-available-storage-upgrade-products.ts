import { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { getSlugInTerm } from 'calypso/my-sites/plans/jetpack-plans/convert-slug-terms';
import getPurchasedStorageSubscriptions from 'calypso/my-sites/plans/jetpack-plans/get-purchased-storage-subscriptions';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { useSelector } from 'calypso/state';
import useGetStorageUpgradeProducts from './use-get-storage-upgrade-products';

const useAvailableStorageUpgradeProducts = ( siteId: number ): SelectorProduct[] => {
	const purchasedStorageSlugs = useSelector( ( state ) =>
		getPurchasedStorageSubscriptions( state, siteId )
	).map( ( { productSlug } ) => productSlug );
	const getStorageUpgradeProducts = useGetStorageUpgradeProducts();

	// This function specifically targets products that haven't been purchased
	const isNotPurchased = useMemo( () => {
		const allDurationsSubscriptions = purchasedStorageSlugs
			.map( ( slug: string ) => [
				getSlugInTerm( slug, TERM_MONTHLY ),
				getSlugInTerm( slug, TERM_ANNUALLY ),
			] )
			.flat();

		return ( { productSlug }: SelectorProduct ) =>
			! allDurationsSubscriptions.includes( productSlug );
	}, [ purchasedStorageSlugs ] );

	const allUpgradeProducts: SelectorProduct[] = [ ...purchasedStorageSlugs ].reduce(
		( acc: SelectorProduct[], slug: string ) => {
			return [ ...acc, ...( getStorageUpgradeProducts( slug ) as SelectorProduct[] ) ];
		},
		[]
	);

	return allUpgradeProducts
		.filter( ( product ): product is SelectorProduct => !! product )
		.filter( isNotPurchased ) as SelectorProduct[];
};

export default useAvailableStorageUpgradeProducts;
