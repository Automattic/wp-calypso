/**
 * External dependencies
 */

import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import canCurrentUser from 'state/selectors/can-current-user';
import { isJetpackSite, isJetpackModuleActive } from 'state/sites/selectors';
import isSiteGoogleMyBusinessEligible from 'state/selectors/is-site-google-my-business-eligible';

/**
 * Returns an object of service objects.
 *
 * @param  {object} state Global state tree
 * @returns {object}       Keyring services, if known.
 */
export function getKeyringServices( state ) {
	return state.sharing.services.items;
}

/**
 * Returns an object of service objects with the specified type.
 *
 * @param  {object} state Global state tree
 * @param  {string} type  Type of service. 'publicize' or 'other'.
 * @returns {Array}        Keyring services, if known.
 */
export function getKeyringServicesByType( state, type ) {
	return filter( getKeyringServices( state ), { type } );
}

/**
 * Returns an object for the specified service name
 *
 * @param  {object} state Global state tree
 * @param  {string} name  Service name
 * @returns {object}        Keyring service, if known, or false.
 */
export function getKeyringServiceByName( state, name ) {
	const services = getKeyringServices( state );

	return services[ name ] ? services[ name ] : false;
}

/**
 * Returns an array of eligible service objects with the specified type.
 *
 * A service is eligible for a given site if
 *  1. it's a Jetpack site and the service supports Jetpack,
 *  2. the service requires an active Jetpack module and that module is active on that site,
 *  3. the current user can publish posts in case of all publicize services.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID.
 * @param  {string} type   Type of service. 'publicize' or 'other'.
 * @returns {Array}         Keyring services, if known.
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
		if (
			isJetpackSite( state, siteId ) &&
			service.jetpack_module_required &&
			! isJetpackModuleActive( state, siteId, service.jetpack_module_required )
		) {
			return false;
		}

		// Omit if Publicize service and user cannot publish
		if ( 'publicize' === service.type && ! canCurrentUser( state, siteId, 'publish_posts' ) ) {
			return false;
		}

		// Omit if site is not eligible or user cannot manage
		if (
			'google_my_business' === service.ID &&
			( ! canCurrentUser( state, siteId, 'manage_options' ) ||
				! isSiteGoogleMyBusinessEligible( state, siteId ) ||
				! config.isEnabled( 'google-my-business' ) )
		) {
			return false;
		}

		// Omit Google Site Verification, which is only available from the Jetpack UI for now
		if ( 'google_site_verification' === service.ID ) {
			return false;
		}

		// Omit Path until API stops returning this service.
		if ( 'path' === service.ID ) {
			return false;
		}

		// Omit Apple as we cannot let users disconnect without losing their name and email
		if ( 'apple' === service.ID ) {
			return false;
		}

		if (
			'google-drive' === service.ID &&
			( ! config.isEnabled( 'google-drive' ) ||
				! canCurrentUser( state, siteId, 'manage_options' ) )
		) {
			return false;
		}

		// Omit Eventbrite as the API that is used by Eventbrite plugin was disabled 20/02/2020
		if ( service.ID === 'eventbrite' ) {
			return false;
		}

		return true;
	} );
}

/**
 * Returns true if a request is in progress to retrieve keyring services,
 * or false otherwise.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean}       Whether a request is in progress
 */
export function isKeyringServicesFetching( state ) {
	return state.sharing.services.isFetching;
}
