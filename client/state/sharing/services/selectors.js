/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import utils from 'lib/site/utils';

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
	return filter( getKeyringServices( state ), { type: type } );
}

/**
 * Returns an object of eligible service objects with the specified type.
 *
 * @param  {Object} state Global state tree
 * @param  {Object} site  Site object.
 * @param  {String} type  Type of service. 'publicize' or 'other'.
 * @return {Array}        Keyring services, if known.
 */
export function getEligibleKeyringServices( state, site, type ) {
	const services = getKeyringServicesByType( state, type );

	if ( ! site ) {
		return services;
	}

	return services.filter( ( service ) => {
		// Omit if the site is Jetpack and service doesn't support Jetpack
		if ( site.jetpack && ! service.jetpack_support ) {
			return false;
		}

		// Omit if Jetpack module not activated
		if ( site.jetpack && service.jetpack_module_required &&
			! site.isModuleActive( service.jetpack_module_required ) ) {
			return false;
		}

		// Omit if service is settings-oriented and user cannot manage
		if ( 'eventbrite' === service.ID && ! utils.userCan( 'manage_options', site ) ) {
			return false;
		}

		// Omit if Publicize service and user cannot publish
		if ( 'publicize' === service.type && ! utils.userCan( 'publish_posts', site ) ) {
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
