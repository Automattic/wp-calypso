/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { initiateTransfer, requestEligibility } from 'state/automated-transfer/actions';
import { transferStates } from 'state/automated-transfer/constants';
import {
	AUTOMATED_TRANSFER_INITIATE_REQUEST,
} from 'state/action-types';

/**
 * Maps from API response to internal representation of automated transfer initialize request
 *
 * @param {Object} data API response data
 * @returns {Object} Calypso eligibility information
 */
const fromApi = data => Object.assign(
	{
		id: data.transfer_id,
	},
	data.status === 'active' && { status: transferStates.START },
	data.status === 'uploading' && { status: transferStates.START },
	data.active_theme_slug && data.active_theme_slug.length && { theme: { id: data.active_theme_slug } },
);

/**
 * Dispatches to initiate an automated transfer for a site
 *
 * @param {Function} dispatch action dispatcher
 * @param {number} siteId site for which the update belongs
 * @returns {Function} the handler function with site and dispatch partially applied
 */
const apiResponse = ( dispatch, siteId ) => data => dispatch( initiateTransfer( siteId, fromApi( data ) ) );

/**
 * Respond to API fetch failure
 *
 * @param {Object} error error from API fetch
 */
const apiFailure = ( dispatch, siteId ) => () => dispatch( requestEligibility( siteId ) );

/**
 * Issues an API request to initiate an automatic transfer
 *
 * @param {Function} dispatch action dispatcher
 * @param {number} siteId which site to transfer
 * @param {string} pluginSlug name of community plugin initiating transfer
 * @param {File} themeFile zip of theme initiating transfer
 * @returns {Promise} response promise from API fetch
 */
export const requestTransfer = ( { dispatch }, { siteId, pluginSlug, themeFile } ) =>
	wpcom.req.post(
		`/sites/${ siteId }/automated-transfers/initiate`,
		{}, // no query args
		Object.assign( {},
			pluginSlug && { plugin: pluginSlug },
			themeFile && { theme: themeFile },
		),
	)
		.then( apiResponse( dispatch, siteId ) )
		.catch( apiFailure( dispatch, siteId ) );

export default {
	[ AUTOMATED_TRANSFER_INITIATE_REQUEST ]: [ requestTransfer ],
};
