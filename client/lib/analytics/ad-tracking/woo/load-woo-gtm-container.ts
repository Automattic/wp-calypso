import { loadScript } from '@automattic/load-script';
import { mayWeTrackByTracker } from '../../tracker-buckets';
import { GOOGLE_GTM_SCRIPT_URL, TRACKING_IDS } from '../constants';

/**
 * We expect GTM to need these globals to be declared.
 */
declare global {
	interface Window {
		dataLayer: {
			push: ( data: Record< string, unknown > ) => void;
		};
		google_tag_manager: Record< string, unknown >;
	}
}

/**
 * Loads the GTM script with the Woo container ID, if the user has consented to tracking,
 * and tracking is allowed by the current environment.
 *
 * @returns Promise<void>
 */
export const loadWooGTMContainer = async (): Promise< void > => {
	// Is Google Tag Manager already initialized?
	if ( window.dataLayer && window.google_tag_manager ) {
		return;
	}

	// Are we allowed to track (user consent, e2e, etc.)?
	if ( ! mayWeTrackByTracker( 'googleTagManager' ) ) {
		return;
	}

	// Load the Google Tag Manager script
	await loadScript( GOOGLE_GTM_SCRIPT_URL + TRACKING_IDS.wooGoogleTagManagerId );
};

/**
 * Initializes the GTM container.
 *
 * @returns Promise<void>
 */
export const initWooGTMContainer = async (): Promise< void > => {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push( { 'gtm.start': new Date().getTime(), event: 'gtm.js' } );
};
