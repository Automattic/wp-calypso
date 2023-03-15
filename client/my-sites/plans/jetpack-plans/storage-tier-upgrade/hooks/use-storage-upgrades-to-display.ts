import { useMemo } from 'react';
import { TIER_1_SLUGS, TIER_2_SLUGS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import useAvailableStorageUpgradeProducts from './use-available-storage-upgrade-products';
import usePurchasedStorageUpgradeProducts from './use-purchased-storage-upgrade-products';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

const UPGRADES_ORDER = [ ...TIER_1_SLUGS, ...TIER_2_SLUGS ];

const useStorageUpgradesToDisplay = ( siteId: number ): SelectorProduct[] => {
	const purchasedUpgrades = usePurchasedStorageUpgradeProducts( siteId );
	const availableUpgrades = useAvailableStorageUpgradeProducts( siteId );

	return useMemo( () => {
		// Always show from the lowest to the highest tier
		availableUpgrades.sort(
			( a, b ) => UPGRADES_ORDER.indexOf( a.productSlug ) - UPGRADES_ORDER.indexOf( b.productSlug )
		);

		const upgradesToDisplay = [
			...purchasedUpgrades,
			// Don't show tier 1 if tier 2 has already been purchased
			...availableUpgrades,
		];

		// Don't show the same product twice
		return upgradesToDisplay.reduce( ( acc: SelectorProduct[], p: SelectorProduct ) => {
			if ( acc.find( ( { productSlug } ) => productSlug === p.productSlug ) ) {
				return acc;
			}

			return [ ...acc, p ];
		}, [] );
	}, [ purchasedUpgrades, availableUpgrades ] );
};

export default useStorageUpgradesToDisplay;
