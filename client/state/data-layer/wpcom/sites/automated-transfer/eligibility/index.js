/** @format */

/**
 * External dependencies
 */

import { get, identity, isEmpty, map } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST } from 'state/action-types';

import { updateEligibility } from 'state/automated-transfer/actions';
import { eligibilityHolds } from 'state/automated-transfer/constants';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Maps the constants used in the WordPress.com API with
 * those used inside of Calypso. Somewhat redundant, this
 * provides safety for when the API changes. We need not
 * changes the constants in the Calypso side, only here
 * in the code directly dealing with the API.
 */
const statusMapping = {
	transfer_already_exists: eligibilityHolds.TRANSFER_ALREADY_EXISTS,
	no_business_plan: eligibilityHolds.NO_BUSINESS_PLAN,
	no_jetpack_sites: eligibilityHolds.NO_JETPACK_SITES,
	no_vip_sites: eligibilityHolds.NO_VIP_SITES,
	site_private: eligibilityHolds.SITE_PRIVATE,
	site_graylisted: eligibilityHolds.SITE_GRAYLISTED,
	non_admin_user: eligibilityHolds.NON_ADMIN_USER,
	not_using_custom_domain: eligibilityHolds.NOT_USING_CUSTOM_DOMAIN,
	not_domain_owner: eligibilityHolds.NOT_DOMAIN_OWNER,
	no_wpcom_nameservers: eligibilityHolds.NO_WPCOM_NAMESERVERS,
	not_resolving_to_wpcom: eligibilityHolds.NOT_RESOLVING_TO_WPCOM,
	no_ssl_certificate: eligibilityHolds.NO_SSL_CERTIFICATE,
	email_unverified: eligibilityHolds.EMAIL_UNVERIFIED,
	excessive_disk_space: eligibilityHolds.EXCESSIVE_DISK_SPACE,
};

/**
 * Maps from API response the issues which prevent automated transfer
 *
 * @param {Object} response API response data
 * @param {Array} response.errors List of { code, message } pairs describing issues
 * @returns {Array} list of hold constants associated with issues listed in API response
 */
const eligibilityHoldsFromApi = ( { errors = [] } ) =>
	errors.map( ( { code } ) => get( statusMapping, code, '' ) ).filter( identity );

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
		.map( ( { description, name, support_url } ) => ( {
			name,
			description,
			supportUrl: support_url,
		} ) );

/**
 * Maps from API response to internal representation of automated transfer eligibility data
 *
 * @param {Object} data API response data
 * @returns {Object} Calypso eligibility information
 */
const fromApi = data => ( {
	lastUpdate: Date.now(),
	eligibilityHolds: eligibilityHoldsFromApi( data ),
	eligibilityWarnings: eligibilityWarningsFromApi( data ),
} );

/**
 * Build track events for eligibility status
 *
 * @param {Object} data eligibility data from the api
 * @returns {Object} An analytics event object
 */
const trackEligibility = data => {
	const isEligible = get( data, 'is_eligible', false );
	const pluginWarnings = get( data, 'warnings.plugins', [] );
	const widgetWarnings = get( data, 'warnings.widgets', [] );
	const hasEligibilityWarnings = ! ( isEmpty( pluginWarnings ) && isEmpty( widgetWarnings ) );

	const eventProps = {
		has_warnings: hasEligibilityWarnings,
		plugins: map( pluginWarnings, 'id' ).join( ',' ),
		widgets: map( widgetWarnings, 'id' ).join( ',' ),
	};

	if ( isEligible ) {
		return recordTracksEvent( 'calypso_automated_transfer_eligibility_eligible', eventProps );
	}

	// add holds to event props if the transfer is ineligible
	eventProps.holds = eligibilityHoldsFromApi( data ).join( ',' );
	return recordTracksEvent( 'calypso_automated_transfer_eligibility_ineligible', eventProps );
};

/**
 * Issues an API request to fetch eligibility information for a site
 *
 * @param {Object} store Redux store
 * @param {Function} store.dispatch action dispatcher
 * @param {action} action Action object
 */
export const requestAutomatedTransferEligibility = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/automated-transfers/eligibility`,
				apiVersion: '1',
			},
			action
		)
	);
};

export const updateAutomatedTransferEligibility = ( { dispatch }, { siteId }, data ) => {
	dispatch(
		withAnalytics( trackEligibility( data ), updateEligibility( siteId, fromApi( data ) ) )
	);
};

export const throwRequestError = ( store, action, error ) => {
	throw new Error( error );
};

registerHandlers( 'state/data-layer/wpcom/sites/automated-transfer/eligibility/index.js', {
	[ AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST ]: [
		dispatchRequest(
			requestAutomatedTransferEligibility,
			updateAutomatedTransferEligibility,
			throwRequestError
		),
	],
} );

export default {};
