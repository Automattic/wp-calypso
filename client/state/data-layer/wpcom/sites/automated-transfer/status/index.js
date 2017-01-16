/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	EVERY_FIVE_SECONDS,
	add as addRunner,
	remove as removeRunner,
} from 'lib/interval/runner';
import wpcom from 'lib/wp';

import {
	AUTOMATED_TRANSFER_STATUS_REQUEST as REQUEST,
	AUTOMATED_TRANSFER_STATUS_UPDATE as UPDATE,
} from 'state/action-types';

import { requestStatus, updateStatus } from 'state/automated-transfer/actions';
import { transferStates } from 'state/automated-transfer/constants';

const watchList = new Map();

const statusMapping = {
	complete: transferStates.COMPLETE,
	uploading: transferStates.START,
};

/**
 * @typedef {Object} StatusResponse
 * @parameter {Number} blog_id id for associated site
 * @parameter {String} [status] description of current step of transfer process
 * @parameter {Number} transfer_id id for associated transfer
 * @parameter {String} [error] description of failed status request if any
 */

/**
 * Maps the results from a status query to the Calypso-native format
 *
 * @param {StatusResponse} data status information
 * @returns {Object} status update
 */
const fromApi = data => ( {
	siteId: data.blog_id,
	status: get( statusMapping, data.status, transferStates.INQUIRING ),
	transferId: data.transfer_id,
} );

/**
 * Maps the results from a status query which failed
 *
 * @augments fromApi
 *
 * @param {StatusResponse} data status information
 * @returns {Object} status failure update
 */
const fromApiFailure = data => ( {
	...fromApi( data ),
	error: data.error,
} );

/**
 * Calls WordPress.com API to request information on the status
 * of an active automated transfer for a given site.
 *
 * @param {Function} dispatch Redux disaptcher
 * @param {Number} siteId id for site to be monitored
 * @returns {Promise} wpcom.js request promise
 */
const pollStatus = ( { dispatch }, { siteId } ) =>
	wpcom.req.get( {
		path: `/sites/${ siteId }/automated-transfers/status`,
	} )
		.then( data => dispatch( updateStatus( fromApi( data ) ) ) )
		.catch( data => dispatch( updateStatus( fromApiFailure( data ) ) ) );

/**
 * Makes sure that status is polled for a given site
 *
 * If a site is not already being polled for its automated
 * transfer status, add it to the global interval runner.
 *
 * @see lib/interval/runner
 *
 * @param {Number} siteId id of site to monitor
 * @param {Function} dispatch Redux dispatcher
 * @returns {undefined}
 */
const ensurePolling = ( siteId, dispatch ) => {
	if ( watchList.has( siteId ) ) {
		return;
	}

	const id = addRunner( EVERY_FIVE_SECONDS, () => dispatch( requestStatus( siteId ) ) );

	watchList.set( siteId, id );
};

/**
 * Stop polling for a given site
 *
 * Removes the action to poll a given site from
 * the global interval runner.
 *
 * @see lib/interval/runner
 *
 * @param {Number} siteId id of site to stop monitoring
 * @returns {undefined}
 */
const stopPolling = siteId => {
	removeRunner( watchList.get( siteId ) );
	watchList.delete( siteId );
};

/**
 * Determines if we need to start or stop polling the status for
 * automated transfers on a site based on the result of the
 * received status information.
 *
 * If the transfer is not complete then we need to start polling
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Number} siteId id of associated site
 * @param {String} status description of active step in transfer process
 * @returns {undefined}
 */
const queueNextRequest = ( { dispatch }, { siteId, status } ) =>
	status === transferStates.COMPLETE
		? stopPolling( siteId )
		: ensurePolling( siteId, dispatch );

export default {
	[ UPDATE ]: [ queueNextRequest ],
	[ REQUEST ]: [ pollStatus ],
};
