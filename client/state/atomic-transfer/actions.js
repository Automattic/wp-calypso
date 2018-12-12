/** @format */

/**
 * Internal dependencies
 */
import {
	ATOMIC_TRANSFER_COMPLETE,
	ATOMIC_TRANSFER_INITIATE,
	ATOMIC_TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET,
} from 'state/action-types';
import 'state/data-layer/wpcom/sites/atomic/transfers';

/**
 * Query for the latest atomic transfer for a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @returns {Object} An action object
 */
export const fetchAtomicTransfer = siteId => ( {
	type: ATOMIC_TRANSFER_REQUEST,
	siteId,
} );

/**
 * Initiate an atomic transfer for a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @param {Object} module The type of transfer trigger. `plugin_zip`, `plugin_slug`, or `theme_zip` as key.
 * @returns {Object} An action object
 */
export const initiateAtomicTransfer = ( siteId, module ) => ( {
	type: ATOMIC_TRANSFER_INITIATE,
	siteId,
	module,
} );

/**
 * Initiate an atomic transfer with plugin zip.
 *
 * @param {number} siteId    The id of the site to query.
 * @param {Object} pluginZip File upload object.
 * @returns {Object} An action object
 */
export const initiateAtomicTransferPluginZip = ( siteId, pluginZip ) =>
	initiateAtomicTransfer( siteId, { plugin_zip: pluginZip } );

/**
 * Initiate an atomic transfer with plugin slug.
 *
 * @param {number} siteId     The id of the site to query.
 * @param {string} pluginSlug Plugin slug.
 * @returns {Object} An action object
 */
export const initiateAtomicTransferPluginSlug = ( siteId, pluginSlug ) =>
	initiateAtomicTransfer( siteId, { plugin_slug: pluginSlug } );

/**
 * Initiate an atomic transfer with theme zip.
 *
 * @param {number} siteId   The id of the site to query.
 * @param {Object} themeZip File upload object.
 * @returns {Object} An action object
 */
export const initiateAtomicTransferThemeZip = ( siteId, themeZip ) =>
	initiateAtomicTransfer( siteId, { theme_zip: themeZip } );

/**
 * Report a failure of fetching Automated Transfer status (for example, the status
 * endpoint returns 404).
 *
 * @param {number} siteId The site id to which the status belongs
 * @returns {Object} An action object
 */
export const atomicTransferFetchingFailure = siteId => ( {
	type: ATOMIC_TRANSFER_REQUEST_FAILURE,
	siteId,
} );

export const atomicTransferComplete = siteId => ( {
	type: ATOMIC_TRANSFER_COMPLETE,
	siteId,
} );

/**
 *
 * @see state/automated-transfer/constants#transferStates
 *
 * @param {number} siteId The site id to which the status belongs
 * @param {Object} transfer atomic transfer object
 * @returns {Object} An action object
 */
export const setAtomicTransfer = ( siteId, transfer ) => ( {
	type: ATOMIC_TRANSFER_SET,
	siteId,
	transfer,
} );
