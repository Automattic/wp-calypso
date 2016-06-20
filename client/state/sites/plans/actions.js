/**
 * External dependencies
 */
import debugFactory from 'debug';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import omit from 'lodash/omit';
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
	SITE_PLANS_TRIAL_CANCEL_FAILED
} from 'state/action-types';
import wpcom from 'lib/wp';
import personalPlan from 'lib/plans/personal-plan';

/**
 * Cancels the specified plan trial for the given site.
 *
 * @param {Number} siteId identifier of the site
 * @param {Number} planId identifier of the plan
 * @returns {Function} a promise that will resolve once updating is completed
 */
export function cancelSitePlanTrial( siteId, planId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_PLANS_TRIAL_CANCEL,
			siteId
		} );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().cancelPlanTrial( planId, ( error, data ) => {
				if ( data && data.success ) {
					dispatch( {
						type: SITE_PLANS_TRIAL_CANCEL_COMPLETED,
						siteId,
						plans: map( data.plans, createSitePlanObject )
					} );

					resolve();
				} else {
					debug( 'Canceling site plan trial failed: ', error );

					const errorMessage = error.message || i18n.translate( 'There was a problem canceling the plan trial. Please try again later or contact support.' );

					dispatch( {
						type: SITE_PLANS_TRIAL_CANCEL_FAILED,
						siteId,
						error: errorMessage
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
	return ( dispatch ) => {
		dispatch( {
			type: SITE_PLANS_FETCH,
			siteId
		} );

		return new Promise( ( resolve ) => {
			wpcom.undocumented().getSitePlans( siteId, ( error, data ) => {
				if ( error ) {
					debug( 'Fetching site plans failed: ', error );

					const errorMessage = error.message || i18n.translate( 'There was a problem fetching site plans. Please try again later or contact support.' );

					dispatch( {
						type: SITE_PLANS_FETCH_FAILED,
						siteId,
						error: errorMessage
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
 * @param {Number} siteId identifier of the site
 * @param {Object} data list of plans received from the API
 * @returns {Object} the corresponding action object
 */
export function fetchSitePlansCompleted( siteId, data ) {
	let plansData = omit( data, '_headers' );
	const { product_id } = personalPlan;

	if ( ! ( isEmpty( plansData ) || has( plansData, product_id ) ) ) {
		const { formatted_price, product_name, product_slug, raw_price } = personalPlan;
		plansData = {
			...plansData,
			[ product_id ]: {
				can_start_trial: true,
				discount_reason: null,
				formatted_discount: '$0',
				formatted_price,
				product_name,
				product_slug,
				product_id,
				raw_discount: 0,
				raw_price
			}
		};
	}

	return {
		type: SITE_PLANS_FETCH_COMPLETED,
		siteId,
		plans: map( plansData, createSitePlanObject )
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
