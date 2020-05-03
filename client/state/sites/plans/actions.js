/**
 * External dependencies
 */

import debugFactory from 'debug';
import { map } from 'lodash';
import i18n from 'i18n-calypso';

const debug = debugFactory( 'calypso:site-plans:actions' );

/**
 * Internal dependencies
 */
import { createSitePlanObject } from './assembler';
import {
	SITE_PLANS_FETCH,
	SITE_PLANS_FETCH_COMPLETED,
	SITE_PLANS_FETCH_FAILED,
	SITE_PLANS_REMOVE,
	SITE_PLANS_TRIAL_CANCEL,
	SITE_PLANS_TRIAL_CANCEL_COMPLETED,
	SITE_PLANS_TRIAL_CANCEL_FAILED,
	SITE_PLAN_OWNERSHIP_TRANSFER,
} from 'state/action-types';
import wpcom from 'lib/wp';

import 'state/data-layer/wpcom/sites/plan-transfer';

/**
 * Cancels the specified plan trial for the given site.
 *
 * @param {number} siteId identifier of the site
 * @param {number} planId identifier of the plan
 * @returns {Function} a promise that will resolve once updating is completed
 */
export function cancelSitePlanTrial( siteId, planId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_PLANS_TRIAL_CANCEL,
			siteId,
		} );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().cancelPlanTrial( planId, ( error, data ) => {
				if ( data && data.success ) {
					dispatch( {
						type: SITE_PLANS_TRIAL_CANCEL_COMPLETED,
						siteId,
						plans: map( data.plans, createSitePlanObject ),
					} );

					resolve();
				} else {
					debug( 'Canceling site plan trial failed: ', error );

					const errorMessage =
						error.message ||
						i18n.translate(
							'There was a problem canceling the plan trial. Please try again later or contact support.'
						);

					dispatch( {
						type: SITE_PLANS_TRIAL_CANCEL_FAILED,
						siteId,
						error: errorMessage,
					} );

					reject( errorMessage );
				}
			} );
		} );
	};
}

/**
 * Returns an action object to be used in signalling that plans for the given site has been cleared.
 *
 * @param {number} siteId identifier of the site
 * @returns {object} the corresponding action object
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

		return new Promise( ( resolve ) => {
			wpcom.undocumented().getSitePlans( siteId, ( error, data ) => {
				if ( error ) {
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
				} else {
					dispatch( fetchSitePlansCompleted( siteId, data ) );
				}

				resolve();
			} );
		} );
	};
}

/**
 * Returns an action object to be used in signalling that an object containing
 * the plans for a given site have been received.
 *
 * @param {number} siteId - identifier of the site
 * @param {object} plans - list of plans received from the API
 * @returns {object} the corresponding action object
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
 * @returns {object} the corresponding action object
 */
export const transferPlanOwnership = ( siteId, newOwnerUserId ) => ( {
	type: SITE_PLAN_OWNERSHIP_TRANSFER,
	newOwnerUserId,
	siteId,
} );
