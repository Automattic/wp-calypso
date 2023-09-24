import { loadScript } from '@automattic/load-script';
import { mayWeInitTracker } from '../tracker-buckets';
import { WPCOM_CLARITY_URI } from './constants';

/**
 * Loads the Microsoft Clarity script, depending on the user's consent.
 * We actually load this in load-tracking-scripts.js, but for conversion tracking
 * it's easier to have a promise based loading mechanism. Will probably remove this
 * and add to it's own PR if we add more event/conversion tracking in Clarity.
 *
 * @see https://www.clarity.ms/
 * @returns Promise<void>
 */
export const loadClarityTracker = async (): Promise< void > => {
	// Are we allowed to track (user consent, e2e, etc.)?
	if ( ! mayWeInitTracker( 'clarity' ) ) {
		throw new Error( 'Tracking is not allowed' );
	}

	// Load the Parsely Tracker script
	await loadScript( WPCOM_CLARITY_URI );
};
