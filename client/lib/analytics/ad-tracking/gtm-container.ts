import { loadScript } from '@automattic/load-script';
import { mayWeInitTracker } from '../tracker-buckets';
import { GOOGLE_GTM_SCRIPT_URL } from './constants';

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
 * @returns Promise<void>
 */
export const loadGTMContainer = async ( gtmTag: string ): Promise< void > => {
	// Are we allowed to track (user consent, e2e, etc.)?
	if ( ! mayWeInitTracker( 'googleTagManager' ) ) {
		throw new Error( 'Tracking is not allowed' );
	}

	// Load the Google Tag Manager script
	await loadScript( GOOGLE_GTM_SCRIPT_URL + gtmTag );
};

/**
 * Initializes the GTM container.
 * @returns Promise<void>
 */
export const initGTMContainer = async (): Promise< void > => {
	// Note: window.dataLayer is prop required by Google. Not to be confused with Calypso Data Layer (see: /client/state/data-layer/README.md)
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push( { 'gtm.start': new Date().getTime(), event: 'gtm.js' } );
};
