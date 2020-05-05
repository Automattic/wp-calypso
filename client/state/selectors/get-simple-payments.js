/**
 * External dependencies
 */

import { get, find, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Get all Simple Payment or the one specified by `simplePaymentId`. They will be returned ordered by
 * ID from the largest to the lowest number (the same as ordering by creation date DESC).
 *
 * @param {object} state           Global state tree
 * @param {int}    siteId          Site which the Simple Payment belongs to.
 * @param {int}    simplePaymentId The ID of the Simple Payment to get. Optional.
 * @returns {Array|object|null}     Array of Simple Payment objects or an object if `simplePaymentId` specified.
 */
export default createSelector(
	( state, siteId, simplePaymentId = null ) => {
		if ( ! siteId ) {
			return null;
		}

		const simplePaymentProducts = get(
			state,
			`simplePayments.productList.items.${ siteId }`,
			null
		);

		if ( ! simplePaymentProducts ) {
			return null;
		}

		if ( ! simplePaymentId ) {
			return orderBy( simplePaymentProducts, 'ID', 'desc' );
		}

		const simplePaymentProduct = find(
			simplePaymentProducts,
			( product ) => product.ID === simplePaymentId
		);

		if ( ! simplePaymentProduct ) {
			return null;
		}

		return simplePaymentProduct;
	},
	( state ) => state.simplePayments.productList.items
);
