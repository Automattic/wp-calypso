/**
 * External dependencies
 */
import { get, identity } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
} from 'state/action-types';

import { updateEligibility } from 'state/automated-transfer/actions';
import {
	transferStates,
	eligibilityHolds,
} from 'state/automated-transfer/constants';

/**
 * Maps the constants used in the WordPress.com API with
 * those used inside of Calypso. Somewhat redundant, this
 * provides safety for when the API changes. We need not
 * changes the constants in the Calypso side, only here
 * in the code directly dealing with the API.
 */
const statusMapping = {
	multiple_users: eligibilityHolds.MULTIPLE_USERS,
	no_vip_sites: eligibilityHolds.NO_VIP_SITES,
	no_business_plan: eligibilityHolds.NO_BUSINESS_PLAN,
	no_wpcom_nameservers: eligibilityHolds.NO_WPCOM_NAMESERVERS,
	not_using_custom_domain: eligibilityHolds.NOT_USING_CUSTOM_DOMAIN,
	non_admin_user: eligibilityHolds.NON_ADMIN_USER,
	site_graylisted: eligibilityHolds.SITE_GRAYLISTED,
	site_private: eligibilityHolds.SITE_PRIVATE,
};

/**
 * Maps from API response the issues which prevent automated transfer
 *
 * @param {Object} response API response data
 * @param {Array} response.errors List of { code, message } pairs describing issues
 * @returns {Array} list of hold constants associated with issues listed in API response
 */
const eligibilityHoldsFromApi = ( { errors = [] } ) =>
	errors
		.map( ( { code } ) => get( statusMapping, code, '' ) )
		.filter( identity );

/**
 * Maps from API response the issues which trigger a confirmation for automated transfer
 *
 * @param {Object} response API response data
 * @param {Object} response.warnings Lists of warnings by type, { plugins, themes }
 * @returns {Array} flat list of warnings with { name, description, supportUrl }
 */
const eligibilityWarningsFromApi = ( { warnings = {} } ) =>
	Object.keys( warnings )
		.reduce( ( list, type ) => list.concat( warnings[ type ] ), [] ) // combine plugin and theme warnings into one list
		.map( ( { description, name, support_url } ) => ( { name, description, supportUrl: support_url } ) );

/**
 * Maps from API response to internal representation of automated transfer eligibility data
 *
 * @param {Object} data API response data
 * @returns {Object} Calypso eligibility information
 */
const fromApi = data => ( {
	lastUpdate: Date.now(),
	status: transferStates.INQUIRING,
	eligibilityHolds: eligibilityHoldsFromApi( data ),
	eligibilityWarnings: eligibilityWarningsFromApi( data ),
} );

/**
 * Dispatches to update eligibility information from API response
 *
 * @param {Function} dispatch action dispatcher
 * @param {number} siteId site for which the update belongs
 * @returns {Function} the handler function with site and dispatch partially applied
 */
const apiResponse = ( dispatch, siteId ) => data => dispatch( updateEligibility( siteId, fromApi( data ) ) );

/**
 * Respond to API fetch failure
 *
 * @param {Object} error error from API fetch
 */
const apiFailure = error => {
	throw new Error( error );
};

/**
 * Issues an API request to fetch eligibility information for a site
 *
 * @param {Object} store Redux store
 * @param {Function} store.dispatch action dispatcher
 * @param {number} siteId Site for which eligibility information is requested
 * @returns {Promise} response promise from API fetch
 */
export const fetchEligibility = ( { dispatch }, { siteId } ) =>
	wpcom.req.get( `/sites/${ siteId }/automated-transfers/eligibility` )
		.then( apiResponse( dispatch, siteId ) )
		.catch( apiFailure );

export default {
	[ AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST ]: [ fetchEligibility ],
};
