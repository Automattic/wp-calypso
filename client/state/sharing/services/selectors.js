/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { canCurrentUser } from 'state/selectors';
import { isJetpackSite, isJetpackModuleActive } from 'state/sites/selectors';

/**
 * Returns an object of service objects.
 *
 * @param  {Object} state Global state tree
 * @return {Object}       Keyring services, if known.
 */
export function getKeyringServices( state ) {
	return state.sharing.services.items;
}

/**
 * Returns an object of service objects with the specified type.
 *
 * @param  {Object} state Global state tree
 * @param  {String} type  Type of service. 'publicize' or 'other'.
 * @return {Array}        Keyring services, if known.
 */
export function getKeyringServicesByType( state, type ) {
	return filter( getKeyringServices( state ), { type } );
}

/**
 * Returns an array of eligible service objects with the specified type.
 *
 * A service is eligible for a given site if
 *  1. it's a Jetpack site and the service supports Jetpack,
 *  2. the service requires an active Jetpack module and that module is active on that site,
 *  3. the current user can manage options in case of the eventbrite service,
 *  4. the current user can publish posts in case of all publicize services.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID.
 * @param  {String} type   Type of service. 'publicize' or 'other'.
 * @return {Array}         Keyring services, if known.
 */
export function getEligibleKeyringServices( state, siteId, type ) {
	const services = getKeyringServicesByType( state, type );

	if ( ! siteId ) {
		return services;
	}

	return services.filter( ( service ) => {
		// Omit if the site is Jetpack and service doesn't support Jetpack
		if ( isJetpackSite( state, siteId ) && ! service.jetpack_support ) {
			return false;
		}

		// Omit if Jetpack module not activated
		if ( isJetpackSite( state, siteId ) && service.jetpack_module_required &&
			! isJetpackModuleActive( state, siteId, service.jetpack_module_required ) ) {
			return false;
		}

		// Omit if service is settings-oriented and user cannot manage
		if ( 'eventbrite' === service.ID && ! canCurrentUser( state, siteId, 'manage_options' ) ) {
			return false;
		}

		// Omit if Publicize service and user cannot publish
		if ( 'publicize' === service.type && ! canCurrentUser( state, siteId, 'publish_posts' ) ) {
			return false;
		}

		return true;
	} );
}

/**
 * Returns true if a request is in progress to retrieve keyring services,
 * or false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean}       Whether a request is in progress
 */
export function isKeyringServicesFetching( state ) {
	return state.sharing.services.isFetching;
}
