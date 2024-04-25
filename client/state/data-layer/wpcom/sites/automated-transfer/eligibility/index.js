import { get, isEmpty, map } from 'lodash';
import { AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST } from 'calypso/state/action-types';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { updateEligibility } from 'calypso/state/automated-transfer/actions';
import { eligibilityHolds } from 'calypso/state/automated-transfer/constants';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';

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
	is_staging_blog: eligibilityHolds.IS_STAGING_SITE,
};

/**
 * Maps from API response the issues which prevent automated transfer
 * @param {Object} response API response data
 * @param {Array} response.errors List of { code, message } pairs describing issues
 * @param {Object} options object
 * @returns {Array} list of hold constants associated with issues listed in API response
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
		.filter( Boolean );

/**
 * Maps from API response the issues which trigger a confirmation for automated transfer
 * @param {Object} response API response data
 * @param {Object} response.warnings Lists of warnings by type, { plugins, themes }
 * @returns {Array} flat list of warnings with { name, description, supportUrl }
 */
const eligibilityWarningsFromApi = ( { warnings = {} } ) =>
	Object.keys( warnings )
		.reduce( ( list, type ) => list.concat( warnings[ type ] ), [] ) // combine plugin and theme warnings into one list
		.map( ( { description, name, support_url, id, domain_names } ) => ( {
			id,
			name,
			description,
			supportUrl: support_url,
			domainNames: domain_names,
		} ) );

/**
 * Maps from API response to internal representation of automated transfer eligibility data
 * @param {Object} data API response data
 * @param {Object} options object
 * @returns {Object} Calypso eligibility information
 */
const fromApi = ( data, options = {} ) => ( {
	lastUpdate: Date.now(),
	eligibilityHolds: eligibilityHoldsFromApi( data, options ),
	eligibilityWarnings: eligibilityWarningsFromApi( data ),
} );

/**
 * Build track events for eligibility status
 * @param {Object} data eligibility data from the api
 * @returns {Object} An analytics event object
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
 * @param {Function} action dispatcher
 * @returns {Object} action
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

export const updateAutomatedTransferEligibility =
	( { siteId }, data ) =>
	( dispatch, getState ) => {
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
