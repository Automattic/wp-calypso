import { JETPACK_BACKUP_ADDON_MONTHLY } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { TIER_1_SLUGS, TIER_2_SLUGS } from 'calypso/my-sites/plans/jetpack-plans/constants';
import useAvailableStorageUpgradeProducts from './use-available-storage-upgrade-products';
import usePurchasedStorageUpgradeProducts from './use-purchased-storage-upgrade-products';
import type { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';

const UPGRADES_ORDER = [ ...TIER_1_SLUGS, ...TIER_2_SLUGS ];

const useStorageUpgradesToDisplay = ( siteId: number ): SelectorProduct[] => {
	const purchases = usePurchasedStorageUpgradeProducts( siteId );
	const availableUpgrades = useAvailableStorageUpgradeProducts( siteId );

	return useMemo( () => {
		const purchasedAddOns = purchases.filter( ( { productSlug } ) =>
			JETPACK_BACKUP_ADDON_MONTHLY.includes(
				productSlug as ( typeof JETPACK_BACKUP_ADDON_MONTHLY )[ number ]
			)
		);

		let upgrades = availableUpgrades;

		// Don't show add-ons with lower storage than the already purchased add-ons
		if ( purchasedAddOns.length > 0 ) {
			const addOnsIndices = purchasedAddOns.map( ( { productSlug } ) =>
				JETPACK_BACKUP_ADDON_MONTHLY.indexOf(
					productSlug as ( typeof JETPACK_BACKUP_ADDON_MONTHLY )[ number ]
				)
			);

			upgrades = upgrades.filter( ( { productSlug } ) => {
				const index = JETPACK_BACKUP_ADDON_MONTHLY.indexOf(
					productSlug as ( typeof JETPACK_BACKUP_ADDON_MONTHLY )[ number ]
				);

				return index === -1 || index > Math.max( ...addOnsIndices );
			} );
		}

		// Always show from the lowest to the highest tier
		upgrades.sort(
			( a, b ) => UPGRADES_ORDER.indexOf( a.productSlug ) - UPGRADES_ORDER.indexOf( b.productSlug )
		);

		const upgradesToDisplay = [
			...purchases,
			// Don't show tier 1 if tier 2 has already been purchased
			...upgrades,
		];

		// Don't show the same product twice
		return upgradesToDisplay.reduce( ( acc: SelectorProduct[], p: SelectorProduct ) => {
			if ( acc.find( ( { productSlug } ) => productSlug === p.productSlug ) ) {
				return acc;
			}

			return [ ...acc, p ];
		}, [] );
	}, [ purchases, availableUpgrades ] );
};

export default useStorageUpgradesToDisplay;
