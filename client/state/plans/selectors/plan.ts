import { createSelector } from '@automattic/state-utils';
import { get, find } from 'lodash';
import type { PricedAPIPlan } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

import 'calypso/state/plans/init';

/**
 * Return WordPress plans getting from state object
 */
export const getPlans = ( state: AppState ): PricedAPIPlan[] => {
	return state.plans.items;
};

/**
 * Return requesting state
 */
export const isRequestingPlans = ( state: AppState ): boolean => {
	return state.plans.requesting;
};

/**
 * Returns a plan
 */
export const getPlan = createSelector(
	( state: AppState, productId: string | number ): PricedAPIPlan | undefined =>
		getPlans( state ).find( ( plan ) => plan.product_id === productId ),
	( state: AppState ) => getPlans( state )
);

/**
 * Returns a plan searched by its slug
 *
 * @param  {Object} state      global state
 * @param  {string} planSlug the plan slug
 * @returns {Object} the matching plan
 */
export const getPlanBySlug = createSelector(
	( state, planSlug ) => find( getPlans( state ), { product_slug: planSlug } ),
	( state ) => getPlans( state )
);

/**
 * Returns a plan product_slug. Useful for getting a cartItem for a plan.
 *
 * @param  {Object}  state     global state
 * @param  {number}  productId the plan productId
 * @returns {string}  plan product_slug
 */
export function getPlanSlug( state: AppState, productId: string | number ): string | null {
	const plan = getPlan( state, productId );

	return get( plan, 'product_slug', null );
}
