import { AddOns } from '@automattic/data-stores';

/**
 * Since 50GB and 100GB storage addons are essentially a 1GB space product with
 * quantity 50/100, this function returns the quantity based on the storage addon slug.
 * This is used to build the shopping cart item for the storage addon.
 * @param storageAddonSlug Slug for the storage addon.
 * @returns Quantity of the 1GB storage product that corresponds to the addon slug.
 */
function getQuantityFromStorageType( storageAddonSlug: string ): number {
	switch ( storageAddonSlug ) {
		case AddOns.ADD_ON_50GB_STORAGE:
			return 50;
		case AddOns.ADD_ON_100GB_STORAGE:
			return 100;
	}

	return 0;
}

export default getQuantityFromStorageType;
