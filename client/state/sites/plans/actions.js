/**
 * External dependencies
 */
import debugFactory from 'debug';
import map from 'lodash/collection/map';
import reject from 'lodash/collection/reject';

const debug = debugFactory( 'calypso:site-plans:actions' );

/**
 * Internal dependencies
 */
import { createSitePlanObject } from './assembler';
import wpcom from 'lib/wp';
import {
	FETCH_SITE_PLANS,
	FETCH_SITE_PLANS_COMPLETED,
	REMOVE_SITE_PLANS
} from 'state/action-types';

/**
 * Clears plans for the given site.
 *
 * @param {Number} siteId identifier of the site
 * @returns {Function} the corresponding action thunk
 */
export function clearSitePlans( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: REMOVE_SITE_PLANS,
			siteId
		} );
	}
}

/**
 * Fetches plans for the given site.
 *
 * @param {Number} siteId identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSitePlans( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: FETCH_SITE_PLANS,
			siteId
		} );

		return new Promise( ( resolve ) => {
			wpcom.undocumented().getSitePlans( siteId, ( error, data ) => {
				if ( error ) {
					debug( 'Fetching site plans failed: ', error );
				} else {
					dispatch( fetchSitePlansCompleted( siteId, data ) );
				}

				resolve();
			} );
		} );
	}
}

/**
 * Returns an action object to be used in signalling that an object containing
 * the plans for a given site have been received.
 *
 * @param {Number} siteId identifier of the site
 * @param {Object} plans list of plans received from the API
 * @returns {Object} the corresponding action object
 */
export function fetchSitePlansCompleted( siteId, plans ) {
	plans = reject( plans, '_headers' );

	return {
		type: FETCH_SITE_PLANS_COMPLETED,
		siteId,
		plans: map( plans, createSitePlanObject )
	};
}

/**
 * Clears plans and fetches them for the given site.
 *
 * @param {Number} siteId identifier of the site
 * @returns {Function} the corresponding action thunk
 */
export function refreshSitePlans( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: REMOVE_SITE_PLANS,
			siteId
		} );

		dispatch( fetchSitePlans( siteId ) );
	}
}
