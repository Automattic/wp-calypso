/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'lib/analytics/tracks';
import { identifyUser } from 'lib/analytics/identify-user';
import { gaRecordEvent } from 'lib/analytics/ga';
import { addToQueue } from 'lib/analytics/queue';
import {
	adTrackSignupStart,
	adTrackSignupComplete,
	adTrackRegistration,
} from 'lib/analytics/ad-tracking';

const signupDebug = debug( 'calypso:analytics:signup' );

export function recordSignupStart( flow, ref ) {
	// Tracks
	recordTracksEvent( 'calypso_signup_start', { flow, ref } );
	// Google Analytics
	gaRecordEvent( 'Signup', 'calypso_signup_start' );
	// Marketing
	adTrackSignupStart( flow );
}

export function recordSignupComplete(
	{ flow, siteId, isNewUser, hasCartItems, isNew7DUserSite },
	now
) {
	const isNewSite = !! siteId;

	if ( ! now ) {
		// Delay using the analytics localStorage queue.
		return addToQueue(
			'signup',
			'recordSignupComplete',
			{ flow, siteId, isNewUser, hasCartItems, isNew7DUserSite },
			true
		);
	}

	// Tracks
	// Note that Tracks expects blog_id to differntiate sites, hence using
	// blog_id instead of site_id here. We keep using "siteId" otherwise since
	// all the other fields still refer with "site". e.g. isNewSite
	recordTracksEvent( 'calypso_signup_complete', {
		flow,
		blog_id: siteId,
		is_new_user: isNewUser,
		is_new_site: isNewSite,
		has_cart_items: hasCartItems,
	} );

	// Google Analytics
	const flags = [
		isNewUser && 'is_new_user',
		isNewSite && 'is_new_site',
		hasCartItems && 'has_cart_items',
	].filter( Boolean );

	gaRecordEvent( 'Signup', 'calypso_signup_complete:' + flags.join( ',' ) );

	if ( isNew7DUserSite ) {
		// Tracks
		recordTracksEvent( 'calypso_new_user_site_creation', { flow } );

		// Google Analytics
		gaRecordEvent( 'Signup', 'calypso_new_user_site_creation' );
	}

	adTrackSignupComplete( { isNewUserSite: isNewUser && isNewSite } );
}

export function recordSignupStep( flow, step ) {
	recordTracksEvent( 'calypso_signup_step_start', { flow, step } );
}

export function recordSignupInvalidStep( flow, step ) {
	recordTracksEvent( 'calypso_signup_goto_invalid_step', { flow, step } );
}

/**
 * Records registration event.
 *
 * @param {object} param {}
 * @param {object} param.userData User data
 * @param {string} param.userData.ID User id
 * @param {string} param.userData.username Username
 * @param {string} param.userData.email Email
 * @param {string} param.flow Registration flow
 * @param {string} param.type Registration type
 */
export function recordRegistration( { userData, flow, type } ) {
	signupDebug( 'recordRegistration:', { userData, flow, type } );

	// Tracks user identification
	identifyUser( userData );
	// Tracks
	recordTracksEvent( 'calypso_user_registration_complete', { flow, type } );
	// Google Analytics
	gaRecordEvent( 'Signup', 'calypso_user_registration_complete' );
	// Marketing
	adTrackRegistration();
}
