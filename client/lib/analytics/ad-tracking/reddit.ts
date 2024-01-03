import { loadScript } from '@automattic/load-script';
import { ResponseCart } from '@automattic/shopping-cart';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { WpcomJetpackCartInfo } from '../utils/split-wpcom-jetpack-cart-info';
import { REDDIT_TRACKING_SCRIPT, WPCOM_REDDIT_PIXEL_ID } from './constants';
import { FlowNames } from './record-hosting-trial-started';

/**
 * We'll be accessing rdt from the window object.
 */
declare global {
	interface Window {
		rdt: {
			callQueue: object[];
			sendEvent: ( ...args: [ string, string?, object? ] ) => void;
		} & ( ( ...args: [ string, string?, object? ] ) => void );
	}
}

/**
 * Loads the Reddit script, if the user has consented to tracking,
 * and tracking is allowed by the current environment.
 * @returns Promise<void>
 */
export const loadRedditTracker = async (): Promise< void > => {
	// Are we allowed to track (user consent, e2e, etc.)?
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}

	const params = {
		optOut: false,
		useDecimalCurrencyValues: true,
	};

	window.rdt =
		window.rdt ||
		function ( ...args: [ string, string?, object? ] ) {
			window.rdt.sendEvent ? window.rdt.sendEvent( ...args ) : window.rdt.callQueue.push( args );
		};

	window.rdt.callQueue = [];

	await loadScript( REDDIT_TRACKING_SCRIPT );

	window.rdt( 'init', WPCOM_REDDIT_PIXEL_ID, params );
};

/**
 * Tracks a page view in Reddit.
 */
export const redditTrackerPageView = (): void => {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}
	loadRedditTracker().then( () => window.rdt && window.rdt( 'track', 'PageVisit' ) );
};

/**
 * Tracks a purchase in Reddit.
 */
export const redditTrackerPurchase = (
	cart: ResponseCart,
	orderId: string,
	wpcomJetpackCartInfo: WpcomJetpackCartInfo
): void => {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}

	if ( ! wpcomJetpackCartInfo.containsWpcomProducts ) {
		return;
	}
	const params = {
		currency: 'USD',
		itemCount: wpcomJetpackCartInfo.wpcomProducts.length,
		transactionId: orderId,
		value: wpcomJetpackCartInfo.wpcomCostUSD,
		products: wpcomJetpackCartInfo.wpcomProducts.map( ( { product_id, product_name } ) => ( {
			id: product_id.toString(),
			name: product_name.toString(),
		} ) ),
	};
	loadRedditTracker().then( () => window.rdt && window.rdt( 'track', 'Purchase', params ) );
};

/**
 * Tracks a lead (free trial) in Reddit.
 */
export const redditTrackerFreeTrialStarted = ( trial_flow_name: FlowNames ): void => {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}

	const params = {
		products: [
			{
				id: 'wpcom_hosting_trial',
				name: trial_flow_name,
				category: 'Free Trial',
			},
		],
	};
	loadRedditTracker().then( () => window.rdt && window.rdt( 'track', 'Lead', params ) );
};
