/**
 * External dependencies
 */
import debugFactory from 'debug';
import map from 'lodash/map';
import omit from 'lodash/omit';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { createSitePlanObject } from './assembler';
import {
	SITE_PLANS_FETCH,
	SITE_PLANS_FETCH_COMPLETED,
	SITE_PLANS_REMOVE,
	SITE_PLANS_TRIAL_CANCEL
} from 'state/action-types';
import { registerConnection } from 'state/connectionMiddleware/middleware';
import {
	connectCancelSitePlanTrial,
	connectFetchSitePlans
} from './connections';

/**
 * Cancels the specified plan trial for the given site.
 *
 * @param {Number} siteId identifier of the site
 * @param {Number} planId identifier of the plan
 * @returns {Function} a promise that will resolve once updating is completed
 */
export function cancelSitePlanTrial( siteId, planId ) {
	return {
		type: SITE_PLANS_TRIAL_CANCEL,
		siteId,
		planId
	}
}
registerConnection( SITE_PLANS_TRIAL_CANCEL, connectCancelSitePlanTrial, { offlineQueue: false } );

/**
 * Returns an action object to be used in signalling that plans for the given site has been cleared.
 *
 * @param {Number} siteId identifier of the site
 * @returns {Object} the corresponding action object
 */
export function clearSitePlans( siteId ) {
	return {
		type: SITE_PLANS_REMOVE,
		siteId
	};
}

/**
 * Fetches plans for the given site.
 *
 * @param {Number} siteId identifier of the site
 * @returns {Function} a promise that will resolve once fetching is completed
 */
export function fetchSitePlans( siteId ) {
	return {
		type: SITE_PLANS_FETCH,
		siteId
	}
}
registerConnection( SITE_PLANS_FETCH, connectFetchSitePlans, { offlineQueue: true, squash: true } );

/**
 * Returns an action object to be used in signalling that an object containing
 * the plans for a given site have been received.
 *
 * @param {Number} siteId identifier of the site
 * @param {Object} data list of plans received from the API
 * @returns {Object} the corresponding action object
 */
export function fetchSitePlansCompleted( siteId, data ) {
	data = omit( data, '_headers' );

	return {
		type: SITE_PLANS_FETCH_COMPLETED,
		siteId,
		plans: map( data, createSitePlanObject )
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
		dispatch( clearSitePlans( siteId ) );
		dispatch( fetchSitePlans( siteId ) );
	};
}
