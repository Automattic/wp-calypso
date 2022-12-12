import { JETPACK_CLOUD_CART_TOGGLE } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Hide the masterbar.
 *
 * @returns {object} Action object
 */
export const closeCart = () => ( { type: JETPACK_CLOUD_CART_TOGGLE, isOpen: false } );

/**
 * Show the masterbar.
 *
 * @returns {object} Action object
 */
export const openCart = () => ( { type: JETPACK_CLOUD_CART_TOGGLE, isOpen: true } );
