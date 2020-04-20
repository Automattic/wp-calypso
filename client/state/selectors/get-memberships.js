/**
 * External dependencies
 */
import { find, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Get all Simple Payment or the one specified by `simplePaymentId`. They will be returned ordered by
 * ID from the largest to the lowest number (the same as ordering by creation date DESC).
 *
 * @param {object} state           Global state tree
 * @param {number}    siteId          Site which the Simple Payment belongs to.
 * @param {number}    simplePaymentId The ID of the Simple Payment to get. Optional.
 * @returns {Array|object|null}     Array of Simple Payment objects or an object if `simplePaymentId` specified.
 */
export default createSelector(
	( state, siteId, membershipsId = null ) => {
		if ( ! siteId ) {
			return null;
		}

		const membershipsProducts = state.memberships.productList.items[ siteId ] ?? null;

		if ( ! membershipsProducts ) {
			return null;
		}

		if ( ! membershipsId ) {
			return orderBy( membershipsProducts, 'ID', 'desc' );
		}

		const membershipProduct = find(
			membershipsProducts,
			( product ) => product.ID === membershipsId
		);

		if ( ! membershipProduct ) {
			return null;
		}

		return membershipProduct;
	},
	( state ) => state.memberships.productList.items
);
