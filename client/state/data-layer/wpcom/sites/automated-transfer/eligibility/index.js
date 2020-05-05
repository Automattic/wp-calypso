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
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';

/**
 * Maps the constants used in the WordPress.com API with
 * those used inside of Calypso. Somewhat redundant, this
 * provides safety for when the API changes. We need not
 * changes the constants in the Calypso side, only here
 * in the code directly dealing with the API.
 */
const statusMapping = {
	blocked_atomic_transfer: eligibilityHolds.BLOCKED_ATOMIC_TRANSFER,
	transfer_already_exists: eligibilityHolds.TRANSFER_ALREADY_EXISTS,
	no_business_plan: eligibilityHolds.NO_BUSINESS_PLAN,
	no_jetpack_sites: eligibilityHolds.NO_JETPACK_SITES,
	no_vip_sites: eligibilityHolds.NO_VIP_SITES,
	site_private: eligibilityHolds.SITE_PRIVATE,
	//site_private: eligibilityHolds.SITE_UNLAUNCHED, // modified in eligibilityHoldsFromApi
	site_graylisted: eligibilityHolds.SITE_GRAYLISTED,
	non_admin_user: eligibilityHolds.NON_ADMIN_USER,
	not_resolving_to_wpcom: eligibilityHolds.NOT_RESOLVING_TO_WPCOM,
	no_ssl_certificate: eligibilityHolds.NO_SSL_CERTIFICATE,
	email_unverified: eligibilityHolds.EMAIL_UNVERIFIED,
	excessive_disk_space: eligibilityHolds.EXCESSIVE_DISK_SPACE,
};

/**
 * Maps from API response the issues which prevent automated transfer
 *
 * @param {object} response API response data
 * @param {Array} response.errors List of { code, message } pairs describing issues
 * @param {object} options object
 * @returns {Array} list of hold constants associated with issues listed in API response
 *
 */
export const eligibilityHoldsFromApi = ( { errors = [] }, options = {} ) =>
	errors
		.map( ( { code } ) => {
			//differentiate on the client between a launched private site vs an unlaunched site
			if ( options.sitePrivateUnlaunched && code === 'site_private' ) {
				return eligibilityHolds.SITE_UNLAUNCHED;
			}
			return get( statusMapping, code, '' );
		} )
		.filter( identity );

/**
 * Maps from API response the issues which trigger a confirmation for automated transfer
 *
 * @param {object} response API response data
 * @param {object} response.warnings Lists of warnings by type, { plugins, themes }
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
 * @param {object} data API response data
 * @param {object} options object
 * @returns {object} Calypso eligibility information
 */
const fromApi = ( data, options = {} ) => ( {
	lastUpdate: Date.now(),
	eligibilityHolds: eligibilityHoldsFromApi( data, options ),
	eligibilityWarnings: eligibilityWarningsFromApi( data ),
} );

/**
 * Build track events for eligibility status
 *
 * @param {object} data eligibility data from the api
 * @returns {object} An analytics event object
 */
const trackEligibility = ( data ) => {
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
 * @param {Function} action dispatcher
 *
 * @returns {object} action
 */
export const requestAutomatedTransferEligibility = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/automated-transfers/eligibility`,
			apiVersion: '1',
		},
		action
	);

export const updateAutomatedTransferEligibility = ( { siteId }, data ) => (
	dispatch,
	getState
) => {
	const siteIsUnlaunched = isUnlaunchedSite( getState(), siteId );
	dispatch(
		withAnalytics(
			trackEligibility( data ),
			updateEligibility( siteId, fromApi( data, { sitePrivateUnlaunched: siteIsUnlaunched } ) )
		)
	);
};

registerHandlers( 'state/data-layer/wpcom/sites/automated-transfer/eligibility/index.js', {
	[ AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST ]: [
		dispatchRequest( {
			fetch: requestAutomatedTransferEligibility,
			onSuccess: updateAutomatedTransferEligibility,
			onError: () => {}, // noop
		} ),
	],
} );
