import { loadScript } from '@automattic/load-script';
import { ResponseCart } from '@automattic/shopping-cart';
import { mayWeInitTracker, mayWeTrackByTracker } from '../tracker-buckets';
import { WpcomJetpackCartInfo } from '../utils/split-wpcom-jetpack-cart-info';
import { REDDIT_TRACKING_SCRIPT, WPCOM_REDDIT_PIXEL_ID } from './constants';

/**
 * We'll be accessing rdt from the window object.
 */
declare global {
	interface Window {
		rdt: ( T: string, V?: string, W?: object ) => void; //TODO - Temp types for now to pass TS warnings.
	}
}

/**
 * Loads the Reddit script, if the user has consented to tracking,
 * and tracking is allowed by the current environment.
 * @returns Promise<void>
 */
export const loadRedditTracker = async (): Promise< void > => {
	// Are we allowed to track (user consent, e2e, etc.)?
	if ( ! mayWeInitTracker( 'reddit' ) ) {
		throw new Error( 'Tracking is not allowed' );
	}

	// Load the Reddit Tracker script
	await loadScript( REDDIT_TRACKING_SCRIPT );

	const params = {
		optOut: false,
		useDecimalCurrencyValues: true,
	};
	window.rdt( 'init', WPCOM_REDDIT_PIXEL_ID, params );
};

/**
 * Tracks a page view in Reddit.
 * @returns Promise<void>
 */
export const redditTrackerPageView = async (): Promise< void > => {
	if ( ! window.rdt ) {
		return;
	}
	await loadRedditTracker();
	window.rdt( 'track', 'PageView' );
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
	loadRedditTracker().then( () => window.rdt( 'track', 'Purchase', params ) );
};

/**
 * Tracks a lead (free trial) in Reddit.
 */
export const redditTrackerFreeTrialStarted = (): void => {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}

	const params = {
		products: [
			{
				id: 'wpcom_hosting_trial',
				name: 'WordPress.com Hosting Trial',
				category: 'Free Trial',
			},
		],
	};
	loadRedditTracker().then( () => window.rdt( 'track', 'Lead', params ) );
};
