/** format */

/**
 * External dependencies
 */
import { flowRight as compose, get } from 'lodash';

/**
 * Returns an atomic transfer object
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {Object} transfer object if avaialable or empty object
 */
export const getAtomicTransfer = ( state, siteId ) =>
	get( state, [ 'atomicTransfer', siteId ], {} );

/**
 * Helper to get status state from local transfer state sub-tree
 *
 * @param {Object} state automated transfer state sub-tree for a site
 * @returns {string} status of transfer
 */
export const getStatusData = state => get( state, 'status', null );

/**
 * Returns status info for transfer
 *
 * @param {Object} state global app state
 * @param {number} siteId requested site for transfer info
 * @returns {string|null} status if available else `null`
 */
export const getAtomicTransferStatus = compose(
	getStatusData,
	getAtomicTransfer
);

