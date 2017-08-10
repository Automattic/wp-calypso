/** @format */
/**
 * External dependencies
 */
import { get, find } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Get all Simple Payment or the one specified by `simplePaymentId`
 *
 * @param {Object} state           Global state tree
 * @param {int}    siteId          Site which the Simple Payment belongs to.
 * @param {int}    simplePaymentId The ID of the Simple Payment to get. Optional.
 * @return {Array|Object|null}     Array of Simple Payment objects or an object if `simplePaymentId` specified.
 */
export default createSelector( ( state, siteId, simplePaymentId = null ) => {
	if ( ! siteId ) {
		return null;
	}

	const simplePaymentProducts = get( state, `simplePayments.productList.items.${ siteId }`, null );

	if ( ! simplePaymentId ) {
		return simplePaymentProducts;
	}

	const simplePaymentProduct = find(
		simplePaymentProducts,
		product => product.ID === simplePaymentId
	);

	if ( ! simplePaymentProduct ) {
		return null;
	}

	return simplePaymentProduct;
}, state => state.simplePayments.productList.items );
