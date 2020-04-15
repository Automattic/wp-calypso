/**
 * External dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import { FLOW_ID } from '../constants';

/**
 * Analytics call at the start of the Gutenboarding flow
 *
 * @param {string} flow The id of the flow, e.g., 'gutenboarding'
 * @param {string} ref  The value of a `ref` query parameter, usually set by marketing landing pages
 */
export function recordOnboardingStart( flow = FLOW_ID, ref = '' ): void {
	if ( ! ref ) {
		ref = new URLSearchParams( window.location.search ).get( 'ref' ) || ref;
	}
	recordTracksEvent( 'calypso_signup_start', { flow, ref } );
}

export function recordOnboardingComplete(
	flow = FLOW_ID,
	{ isNewUser = false, isNewSite = true, hasCartItems = false }
): void {
	recordTracksEvent( 'calypso_signup_complete', {
		flow,
		is_new_user: isNewUser,
		is_new_site: isNewSite,
		has_cart_items: hasCartItems,
	} );
}
