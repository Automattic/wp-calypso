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
} from './action-types';

/**
 * Returns an action object to be used in fetching an object containing
 * the plans for the given site.
 *
 * @param  {Object} siteId ID of the concerned site
 * @return {Object}        Action object
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
 * @param  {Object} siteId ID of the concerned site
 * @param  {Object} plans  Plans received
 * @return {Object}        Action object
 */
export function fetchSitePlansCompleted( siteId, plans ) {
	plans = reject( plans, '_headers' );

	return {
		type: FETCH_SITE_PLANS_COMPLETED,
		siteId,
		plans: map( plans, createSitePlanObject )
	};
}
