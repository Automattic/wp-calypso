import debugFactory from 'debug';
import i18n from 'i18n-calypso';
import { map } from 'lodash';
import wpcom from 'calypso/lib/wp';
import {
	SITE_PLANS_FETCH,
	SITE_PLANS_FETCH_COMPLETED,
	SITE_PLANS_FETCH_FAILED,
	SITE_PLANS_REMOVE,
	SITE_PLAN_OWNERSHIP_TRANSFER,
} from 'calypso/state/action-types';
import { createSitePlanObject } from './assembler';

import 'calypso/state/data-layer/wpcom/sites/plan-transfer';
import 'calypso/state/currency-code/init';

const debug = debugFactory( 'calypso:site-plans:actions' );

/**
 * Returns an action object to be used in signalling that plans for the given site has been cleared.
 *
 * @param {number} siteId identifier of the site
 * @returns {Object} the corresponding action object
 */
export function clearSitePlans( siteId ) {
	return {
		type: SITE_PLANS_REMOVE,
		siteId,
	};
}

/**
 * Fetches plans for the given site.
 *
 * @param {number} siteId identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSitePlans( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_PLANS_FETCH,
			siteId,
		} );

		return wpcom.req
			.get( `/sites/${ siteId }/plans`, { apiVersion: '1.3' } )
			.then( ( data ) => {
				dispatch( fetchSitePlansCompleted( siteId, data ) );
			} )
			.catch( ( error ) => {
				debug( 'Fetching site plans failed: ', error );

				const errorMessage =
					error.message ||
					i18n.translate(
						'There was a problem fetching site plans. Please try again later or contact support.'
					);

				dispatch( {
					type: SITE_PLANS_FETCH_FAILED,
					siteId,
					error: errorMessage,
				} );
			} );
	};
}

/**
 * Returns an action object to be used in signalling that an object containing
 * the plans for a given site have been received.
 *
 * @param {number} siteId - identifier of the site
 * @param {Object} plans - list of plans received from the API
 * @returns {Object} the corresponding action object
 */
export function fetchSitePlansCompleted( siteId, plans ) {
	return {
		type: SITE_PLANS_FETCH_COMPLETED,
		siteId,
		plans: map( plans, createSitePlanObject ),
	};
}

/**
 * Clears plans and fetches them for the given site.
 *
 * @param {number} siteId identifier of the site
 * @returns {Function} the corresponding action thunk
 */
export function refreshSitePlans( siteId ) {
	return ( dispatch ) => {
		dispatch( clearSitePlans( siteId ) );
		dispatch( fetchSitePlans( siteId ) );
	};
}

/**
 * Returns an action object to be used in signalling that site plan ownership
 * change to another user has started.
 *
 * @param {number} siteId - ID of the site
 * @param {number} newOwnerUserId - ID of the new owner user
 * @returns {Object} the corresponding action object
 */
export const transferPlanOwnership = ( siteId, newOwnerUserId ) => ( {
	type: SITE_PLAN_OWNERSHIP_TRANSFER,
	newOwnerUserId,
	siteId,
} );
