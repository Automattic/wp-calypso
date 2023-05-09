import { getCurrentUser } from '@automattic/calypso-analytics';
import { clone, cloneDeep } from 'lodash';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

/**
 * Records an event in Criteo
 *
 * @param {string} eventName - The name of the 'event' property such as 'viewItem' or 'viewBasket'
 * @param {Object} eventProps - Additional details about the event such as `{ item: '1' }`
 * @returns {void}
 */
export async function recordInCriteo( eventName, eventProps ) {
	if ( ! mayWeTrackByTracker( 'criteo' ) ) {
		debug( 'recordInCriteo: [Skipping] ad tracking is not allowed' );
		return;
	}

	await loadTrackingScripts();

	const events = [];
	const currentUser = getCurrentUser();

	events.push( { event: 'setAccount', account: TRACKING_IDS.criteo } );
	events.push( { event: 'setSiteType', type: criteoSiteType() } );

	if ( currentUser ) {
		events.push( { event: 'setEmail', email: [ currentUser.hashedPii.email ] } );
	}

	const conversionEvent = clone( eventProps );
	conversionEvent.event = eventName;
	events.push( conversionEvent );

	// The deep clone is necessary because the Criteo script modifies the objects in the
	// array which causes the console to display different data than is originally added
	debug( 'recordInCriteo: ' + eventName, cloneDeep( events ) );
	window.criteo_q.push( ...events );
}

/**
 * Records in Criteo that the visitor viewed the plans page
 */
export function recordPlansViewInCriteo() {
	if ( ! mayWeTrackByTracker( 'criteo' ) ) {
		return;
	}

	const params = [
		'viewItem',
		{
			item: '1',
		},
	];
	debug( 'recordPlansViewInCriteo:', params );
	recordInCriteo( ...params );
}

/**
 * Records that a user viewed the checkout page
 *
 * @param {Object} cart - cart as `ResponseCart` object
 * @returns {void}
 */
export function recordViewCheckoutInCriteo( cart ) {
	if ( ! mayWeTrackByTracker( 'criteo' ) ) {
		return;
	}

	if ( cart.is_signup ) {
		return;
	}

	// Note that unlike `recordOrderInCriteo` above, this doesn't include the order id
	const params = [
		'viewBasket',
		{
			currency: cart.currency,
			item: cartToCriteoItems( cart ),
		},
	];
	debug( 'recordViewCheckoutInCriteo:', params );
	recordInCriteo( ...params );
}

/**
 * Converts the products in a cart to the format Criteo expects for its `items` property
 *
 * @param {Object} cart - cart as `ResponseCart` object
 * @returns {Array} - An array of items to include in the Criteo tracking call
 */
export function cartToCriteoItems( cart ) {
	return cart.products.map( ( product ) => {
		return {
			id: product.product_id,
			price: product.cost,
			quantity: product.volume,
		};
	} );
}

/**
 * Returns the site type value that Criteo expects
 * Note: this logic was provided by Criteo and should not be modified
 *
 * @returns {string} 't', 'm', or 'd' for tablet, mobile, or desktop
 */
function criteoSiteType() {
	if ( /iPad/.test( window.navigator.userAgent ) ) {
		return 't';
	}

	if ( /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test( window.navigator.userAgent ) ) {
		return 'm';
	}

	return 'd';
}
