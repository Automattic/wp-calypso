/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the note list for a given order has been successfully loaded from the server.
 */
export const areOrderNotesLoaded = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'orders',
		'notes',
		'isLoading',
		orderId,
	] );
	// Strict check because it could also be undefined.
	return false === isLoading;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether the note list for a given order is currently being retrieved from the server.
 */
export const areOrderNotesLoading = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const isLoading = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'orders',
		'notes',
		'isLoading',
		orderId,
	] );
	// Strict check because it could also be undefined.
	return true === isLoading;
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {Array} List of order notes
 */
export const getOrderNotes = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	if ( ! areOrderNotesLoaded( state, orderId, siteId ) ) {
		return [];
	}

	const notes = get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'notes', 'items' ],
		{}
	);
	const notesForOrder = get(
		state,
		[ 'extensions', 'woocommerce', 'sites', siteId, 'orders', 'notes', 'orders', orderId ],
		[]
	);
	return notesForOrder.map( ( id ) => notes[ id ] );
};

/**
 * @param {object} state Whole Redux state tree
 * @param {number} orderId Order ID to check.
 * @param {number} [siteId] Site ID to check. If not provided, the Site ID selected in the UI will be used
 * @returns {boolean} Whether we're currently saving a note for a given order on a site.
 */
export const isOrderNoteSaving = ( state, orderId, siteId = getSelectedSiteId( state ) ) => {
	const isSaving = get( state, [
		'extensions',
		'woocommerce',
		'sites',
		siteId,
		'orders',
		'notes',
		'isSaving',
		orderId,
	] );
	return !! isSaving;
};
