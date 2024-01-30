import { combineReducers } from 'redux';
import {
	MEMBERSHIPS_COUPONS_RECEIVE,
	MEMBERSHIPS_COUPON_DELETE,
	MEMBERSHIPS_COUPON_RECEIVE,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import couponListSchema from './schema';

/**
 * Edits existing coupon if one with matching ID found.
 * Otherwise inserts the new one at the beginning of the list.
 * @param {Array} list of previous coupons
 * @param {Object} newCoupon to update list with
 * @returns {Array} updated array of coupon
 */
function addOrEditCoupon( list = [], newCoupon ) {
	let found = 0;
	const coupons = list.map( ( coupon ) => {
		if ( coupon.ID === newCoupon.ID ) {
			found = 1;
			return newCoupon;
		}
		return coupon;
	} );
	if ( ! found ) {
		return [ newCoupon, ...coupons ];
	}
	return coupons;
}

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site roles.
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const items = withSchemaValidation( couponListSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case MEMBERSHIPS_COUPONS_RECEIVE: {
			const { siteId, coupons } = action;

			return {
				...state,
				[ siteId ]: coupons,
			};
		}
		case MEMBERSHIPS_COUPON_RECEIVE: {
			const { siteId, coupon } = action;

			return {
				...state,
				[ siteId ]: addOrEditCoupon( state[ siteId ], coupon ),
			};
		}
		case MEMBERSHIPS_COUPON_DELETE: {
			const { siteId, coupon } = action;

			return {
				...state,
				[ siteId ]: state[ siteId ].filter( ( existingCoupon ) => existingCoupon.ID !== coupon.ID ),
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
} );
