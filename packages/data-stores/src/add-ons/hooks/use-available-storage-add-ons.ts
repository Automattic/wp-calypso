import { useMemo } from '@wordpress/element';
import { useSiteMediaStorage } from '../../site';
import { ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE, STORAGE_LIMIT } from '../constants';
import useStorageAddOns from './use-storage-add-ons';
import type { PlanSlug } from '@automattic/calypso-products';

interface Props {
	planSlug: PlanSlug;
	siteId?: number | null;
}

/**
 * Returns the storage add-ons that are available for the current site or plan.
 * Conditions:
 * - If the plan is eligible for a storage upgrade (only PLAN_BUSINESS & PLAN_ECOMMERCE are eligible).
 * - If the user has not purchased the storage add-on.
 * - If the storage add-on does not exceed the site storage limits.
 * - If the quantity of the storage add-on is less than or equal to the available storage upgrade.
 */
const useAvailableStorageAddOns = ( { planSlug, siteId }: Props ) => {
	const storageAddOns = useStorageAddOns( { siteId } );
	const siteMediaStorage = useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const currentMaxStorage = siteMediaStorage.data?.maxStorageBytes
		? siteMediaStorage.data.maxStorageBytes / Math.pow( 1024, 3 )
		: 0;
	const availableStorageUpgrade = STORAGE_LIMIT - currentMaxStorage;

	return useMemo( () => {
		const availableStorageAddOns = ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug )
			? storageAddOns.filter( ( addOn ) =>
					addOn
						? ! addOn.purchased &&
						  ! addOn.exceedsSiteStorageLimits &&
						  ( addOn.quantity ?? 0 ) <= availableStorageUpgrade
						: false
			  )
			: null;

		return availableStorageAddOns?.length ? availableStorageAddOns : null;
	}, [ availableStorageUpgrade, planSlug, storageAddOns ] );
};

export default useAvailableStorageAddOns;
