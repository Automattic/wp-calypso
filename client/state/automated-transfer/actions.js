import {
	AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP,
	AUTOMATED_TRANSFER_STATUS_REQUEST,
	AUTOMATED_TRANSFER_STATUS_REQUEST_ONCE,
	AUTOMATED_TRANSFER_STATUS_SET,
	AUTOMATED_TRANSFER_STATUS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/sites/automated-transfer/eligibility';
import 'calypso/state/data-layer/wpcom/sites/automated-transfer/initiate';
import 'calypso/state/data-layer/wpcom/sites/automated-transfer/status';

import 'calypso/state/automated-transfer/init';

/**
 * Initiate a transfer to an Atomic site.
 *
 * This action is only for initiating with a plugin zip. For initiating with
 * plugin ID or theme zip, see state/themes/actions#initiateThemeTransfer
 *
 * @param {number} siteId The id of the site to transfer
 * @param {window.File} pluginZip The plugin to upload and install on transferred site
 * @returns {object} An action object
 */
export const initiateAutomatedTransferWithPluginZip = ( siteId, pluginZip ) => ( {
	type: AUTOMATED_TRANSFER_INITIATE_WITH_PLUGIN_ZIP,
	siteId,
	pluginZip,
} );

/**
 * Query the automated transfer status of a given site.
 *
 * @param {number} siteId The id of the site to query.
 * @returns {object} An action object
 */
export const fetchAutomatedTransferStatus = ( siteId ) => ( {
	type: AUTOMATED_TRANSFER_STATUS_REQUEST,
	siteId,
} );

export const fetchAutomatedTransferStatusOnce = ( siteId ) => ( {
	type: AUTOMATED_TRANSFER_STATUS_REQUEST_ONCE,
	siteId,
} );

/**
 * Sets the status of an automated transfer for a particular site.
 *
 * If the transfer has been initiated by uploading a plugin, the
 * ID of that plugin is returned in the API response alongside the
 * current status.
 *
 * @see state/automated-transfer/constants#transferStates
 * @param {number} siteId The site id to which the status belongs
 * @param {string} status The new status of the automated transfer
 * @param {string} uploadedPluginId Id of any uploaded plugin
 * @returns {object} An action object
 */
export const setAutomatedTransferStatus = ( siteId, status, uploadedPluginId ) => ( {
	type: AUTOMATED_TRANSFER_STATUS_SET,
	siteId,
	status,
	uploadedPluginId,
} );

/**
 * Report a failure of fetching Automated Transfer status (for example, the status
 * endpoint returns 404).
 *
 * @param {object} param failure details
 * @param {number} param.siteId The site id to which the status belongs
 * @param {string} param.error The error string received
 * @returns {object} An action object
 */
export const automatedTransferStatusFetchingFailure = ( { siteId, error } ) => ( {
	type: AUTOMATED_TRANSFER_STATUS_REQUEST_FAILURE,
	siteId,
	error,
} );

/**
 * Indicates that we need the eligibility information for a given site
 *
 * @param {number} siteId site for requested information
 * @returns {object} Redux action
 */
export const requestEligibility = ( siteId ) => ( {
	type: AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
	siteId,
} );

/**
 * Merges given eligibility information into the app state
 *
 * @see state/automated-transfer/eligibility/reducer
 * @param {number} siteId Site to which the information belongs
 * @param {object} param eligibility information to be merged into existing state
 * @param {object} param.eligibilityHolds The holds for eligibility
 * @param {object} param.eligibilityWarnings Warnings against eligibility
 * @param {object} param.lastUpdate last time the state was fetched
 * @param {object} param.status transfer status
 * @returns {object} Redux action
 */
export const updateEligibility = (
	siteId,
	{ eligibilityHolds, eligibilityWarnings, lastUpdate, status }
) => ( {
	type: AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE,
	eligibilityHolds,
	eligibilityWarnings,
	lastUpdate,
	siteId,
	status,
} );
