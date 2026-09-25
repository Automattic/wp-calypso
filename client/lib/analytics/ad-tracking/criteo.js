import { getCurrentUser } from '@automattic/calypso-analytics';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { getReceiptItemCost } from '../utils/receipt-item-details';
import { debug, TRACKING_IDS } from './constants';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

/**
 * Records an event in Criteo
 * @param {string} eventName - The name of the 'event' property such as 'viewItem' or 'viewBasket'
 * @param {Record<string, any>} eventProps - Additional details about the event such as `{ item: '1' }`
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

	const conversionEvent = { ...eventProps };
	conversionEvent.event = eventName;
	events.push( conversionEvent );

	// The deep clone is necessary because the Criteo script modifies the objects in the
	// array which causes the console to display different data than is originally added
	debug( 'recordInCriteo: ' + eventName, structuredClone( events ) );
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
 * Converts the items in a receipt to the format Criteo expects for its `items` property
 * @param {import('@automattic/api-core').Receipt} receipt - The receipt for the purchase
 * @returns {Array} - An array of items to include in the Criteo tracking call
 */
export function receiptToCriteoItems( receipt ) {
	return receipt.items.map( ( item ) => {
		return {
			id: item.product_id,
			price: getReceiptItemCost( item, receipt.currency ),
			quantity: item.volume,
		};
	} );
}

/**
 * Returns the site type value that Criteo expects
 * Note: this logic was provided by Criteo and should not be modified
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
