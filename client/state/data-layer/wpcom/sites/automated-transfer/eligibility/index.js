/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST,
} from 'state/action-types';

import { updateEligibility } from 'state/automated-transfer/actions';
import {
	AUTOMATED_TRANSFER_STATUS,
	eligibilityHolds,
} from 'state/automated-transfer/constants';

const eligibilityUrl = domain =>
	`https://public-api.wordpress.com/rest/v1/sites/${ domain }/automated-transfers/eligibility`;

const statusMapping = {
	no_wpcom_nameservers: eligibilityHolds.NO_WPCOM_NAMESERVERS,
	not_using_custom_domain: eligibilityHolds.NOT_USING_CUSTOM_DOMAIN,
	non_admin_user: eligibilityHolds.NON_ADMIN_USER,
	site_graylisted: eligibilityHolds.SITE_GRAYLISTED,
	site_private: eligibilityHolds.SITE_PRIVATE,
};

const fromApi = data => ( {
	lastUpdate: Date.now(),
	status: AUTOMATED_TRANSFER_STATUS.INQUIRING,
	eligibilityHolds: get( statusMapping, data.status_code, [] ),
	eligibilityWarnings: [
		...get( data, 'warnings.plugins', [] ),
		...get( data, 'warnings.widgets', [] ),
	].map( ( { description, name, support_url } ) => ( { name, description, supportUrl: support_url } ) ),
} );

const receiveEligibility = ( dispatch, domain ) => data =>
	dispatch( updateEligibility( domain, fromApi( data ) ) );

export const fetchEligibility = ( { dispatch }, { domain } ) =>
	fetch( eligibilityUrl( domain ) )
		.then( response => response.json() )
		.then( receiveEligibility( dispatch, domain ) )
		.catch( error => { throw new Error( error ) } );

export default {
	[ AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST ]: [ fetchEligibility ],
}
