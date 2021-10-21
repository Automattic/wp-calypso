import { useMemo } from 'react';
import {
	isTier2,
	TIER_1_SLUGS,
	TIER_2_SLUGS,
} from 'calypso/my-sites/plans/jetpack-plans/constants';
import useAvailableStorageUpgradeProducts from './use-available-storage-upgrade-products';
import usePurchasedStorageUpgradeProducts from './use-purchased-storage-upgrade-products';
import type { Duration, SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

const UPGRADES_ORDER = [ ...TIER_1_SLUGS, ...TIER_2_SLUGS ];

const useStorageUpgradesToDisplay = ( siteId: number, duration: Duration ): SelectorProduct[] => {
	const purchasedUpgrades = usePurchasedStorageUpgradeProducts( siteId );
	const availableUpgrades = useAvailableStorageUpgradeProducts( siteId, duration );

	return useMemo( () => {
		const hasTier2Purchase = purchasedUpgrades.some( ( { productSlug } ) =>
			TIER_2_SLUGS.includes( productSlug )
		);

		const upgradesToDisplay = [
			...purchasedUpgrades,
			// Don't show tier 1 if tier 2 has already been purchased
			...( hasTier2Purchase
				? availableUpgrades.filter( ( { productSlug } ) => isTier2( productSlug ) )
				: availableUpgrades ),
		];

		// Always show from the lowest to the highest tier
		return upgradesToDisplay.sort(
			( a, b ) => UPGRADES_ORDER.indexOf( a.productSlug ) - UPGRADES_ORDER.indexOf( b.productSlug )
		);
	}, [ purchasedUpgrades, availableUpgrades ] );
};

export default useStorageUpgradesToDisplay;
