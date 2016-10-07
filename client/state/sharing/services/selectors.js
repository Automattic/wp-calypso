/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { canCurrentUser } from 'state/current-user/selectors';
import { isJetpackSite, isJetpackModuleActive } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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
 * Returns an object of eligible service objects with the specified type.
 *
 * @param  {Object} state  Global state tree
 * @param  {String} type   Type of service. 'publicize' or 'other'.
 * @return {Array}         Keyring services, if known.
 */
export function getEligibleKeyringServices( state, type ) {
	const siteId = getSelectedSiteId( state ),
		services = getKeyringServicesByType( state, type );

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
