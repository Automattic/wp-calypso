import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { getAddOn } from '@automattic/data-stores/src/add-ons/add-ons-list';
import { isPreselectablePlan, supportsStorageAddOn } from 'calypso/lib/signup/legacy-plan-flows';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { PreselectablePlan } from 'calypso/lib/signup/legacy-plan-flows';

type StorageAddOnSlug = ( typeof AddOns.STORAGE_ADD_ONS )[ number ];

function isStorageAddOnSlug( slug: string ): slug is StorageAddOnSlug {
	return ( AddOns.STORAGE_ADD_ONS as readonly string[] ).includes( slug );
}

/**
 * The plan named by `?plan=`, or null when it is absent or not one the legacy plan flows
 * preselected. Falling back to null keeps the plans grid as the graceful degradation, which
 * is what an unrecognised flow name already did on the `/start` side.
 */
export function getPreselectedPlan( query: URLSearchParams ): PreselectablePlan | null {
	const productSlug = query.get( 'plan' );

	return productSlug && isPreselectablePlan( productSlug ) ? productSlug : null;
}

/**
 * The storage add-on named by `?storage=`, as a cart product.
 *
 * `feature_slug` is pinned to the 50GB add-on for every size, which is what the legacy
 * storage-addon step sent — the quantity is what distinguishes the tiers. Kept as-is so
 * carts built here match the ones built before; worth a separate look, not a silent change.
 */
export function getPreselectedStorageAddOn(
	query: URLSearchParams
): MinimalRequestCartProduct | null {
	const plan = getPreselectedPlan( query );

	// `/setup/onboarding` is public, and this add-on on any other plan was never purchasable.
	if ( ! plan || ! supportsStorageAddOn( plan ) ) {
		return null;
	}

	const selectedStorage = query.get( 'storage' );

	if ( ! selectedStorage || ! isStorageAddOnSlug( selectedStorage ) ) {
		return null;
	}

	const addOn = getAddOn( selectedStorage );

	if ( ! addOn?.quantity ) {
		return null;
	}

	return {
		product_slug: PRODUCT_1GB_SPACE,
		quantity: addOn.quantity,
		volume: 1,
		extra: { feature_slug: AddOns.ADD_ON_50GB_STORAGE },
	};
}

/**
 * Whether this visit passes the plans grid by. Both halves are required: the query is the one
 * that decides, because `planCartItem` is persisted and a leftover from an old session would
 * send an ordinary visitor past the grid; the cart then has to agree, because a plan is seeded
 * on entry alone and a deep link to a later step still has one to ask for.
 */
export function shouldSkipPlansStep(
	query: URLSearchParams,
	planCartItem: MinimalRequestCartProduct | null | undefined
): boolean {
	const plan = getPreselectedPlan( query );

	return !! plan && planCartItem?.product_slug === plan;
}
