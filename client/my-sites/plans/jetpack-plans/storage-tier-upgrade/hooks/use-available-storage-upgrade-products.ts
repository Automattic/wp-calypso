import {
	isJetpackBackupSlug,
	isJetpackSecuritySlug,
	TERM_ANNUALLY,
	TERM_MONTHLY,
	JETPACK_BACKUP_ADDON_PRODUCTS,
} from '@automattic/calypso-products';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getSlugInTerm } from 'calypso/my-sites/plans/jetpack-plans/convert-slug-terms';
import getPurchasedStorageSubscriptions from 'calypso/my-sites/plans/jetpack-plans/get-purchased-storage-subscriptions';
import { Duration, SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import useGetStorageUpgradeProducts from './use-get-storage-upgrade-products';

const useAvailableStorageUpgradeProducts = (
	siteId: number,
	duration: Duration
): SelectorProduct[] => {
	const purchasedStorageSlugs = useSelector( ( state ) =>
		getPurchasedStorageSubscriptions( state, siteId )
	).map( ( { productSlug } ) => productSlug );
	const getStorageUpgradeProducts = useGetStorageUpgradeProducts();

	const sameDurationFilter = ( p: SelectorProduct ) => p.term === duration;

	// Only ever include upgrades for one type of product
	// (Security having the most precedence, in case a
	// site has both Backup and Security for some strange reason)
	const sameProductType = useMemo( () => {
		const hasJetpackSecurity = purchasedStorageSlugs.some( isJetpackSecuritySlug );
		if ( hasJetpackSecurity ) {
			return ( { productSlug }: SelectorProduct ) => isJetpackSecuritySlug( productSlug );
		}

		// If the selected site has Backup, or doesn't have Backup _or_ Security,
		// default to showing only Backup products.
		return ( { productSlug }: SelectorProduct ) =>
			isJetpackBackupSlug( productSlug ) ||
			JETPACK_BACKUP_ADDON_PRODUCTS.includes( productSlug as any );
	}, [ purchasedStorageSlugs ] );

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
		.filter( sameDurationFilter )
		.filter( sameProductType )
		.filter( isNotPurchased ) as SelectorProduct[];
};

export default useAvailableStorageUpgradeProducts;
