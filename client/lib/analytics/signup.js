import { resolveDeviceTypeByViewPort } from '@automattic/viewport';
import debug from 'debug';
import {
	adTrackSignupStart,
	adTrackSignupComplete,
	adTrackRegistration,
} from 'calypso/lib/analytics/ad-tracking';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { identifyUser } from 'calypso/lib/analytics/identify-user';
import { addToQueue } from 'calypso/lib/analytics/queue';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { setSignupStartTime, getSignupCompleteElapsedTime } from 'calypso/signup/storageUtils';

const signupDebug = debug( 'calypso:analytics:signup' );

export function recordSignupStart( flow, ref, optionalProps ) {
	setSignupStartTime();

	// Tracks
	recordTracksEvent( 'calypso_signup_start', {
		flow,
		ref,
		...optionalProps,
	} );
	// Google Analytics
	gaRecordEvent( 'Signup', 'calypso_signup_start' );
	// Marketing
	adTrackSignupStart( flow );
}

// domain sources for calypso_signup_complete tracks event
export const SIGNUP_DOMAIN_ORIGIN = {
	USE_YOUR_DOMAIN: 'use-your-domain',
	CHOOSE_LATER: 'choose-later',
	FREE: 'free',
	CUSTOM: 'custom',
	NOT_SET: 'not-set',
};

export function recordSignupComplete(
	{
		flow,
		siteId,
		isNewUser,
		isBlankCanvas,
		hasCartItems,
		planProductSlug,
		domainProductSlug,
		theme,
		intent,
		startingPoint,
		isTransfer,
		isMapping,
		signupDomainOrigin,
		elapsedTimeSinceStart = null,
		framework,
		goals,
	},
	now
) {
	const isNewSite = !! siteId;

	if ( ! now ) {
		// Delay using the analytics localStorage queue.
		return addToQueue(
			'signup',
			'recordSignupComplete',
			{
				elapsedTimeSinceStart: elapsedTimeSinceStart ?? getSignupCompleteElapsedTime(),
				flow,
				siteId,
				isNewUser,
				isBlankCanvas,
				hasCartItems,
				planProductSlug,
				domainProductSlug,
				theme,
				intent,
				startingPoint,
				isTransfer,
				isMapping,
				signupDomainOrigin,
				framework,
				goals,
			},
			true
		);
	}

	// Tracks
	// Note that Tracks expects blog_id to differntiate sites, hence using
	// blog_id instead of site_id here. We keep using "siteId" otherwise since
	// all the other fields still refer with "site". e.g. isNewSite
	recordTracksEvent( 'calypso_signup_complete', {
		elapsed_time_since_start: elapsedTimeSinceStart ?? getSignupCompleteElapsedTime(),
		flow,
		blog_id: siteId,
		is_new_user: isNewUser,
		is_new_site: isNewSite,
		is_blank_canvas: isBlankCanvas,
		has_cart_items: hasCartItems,
		plan_product_slug: planProductSlug,
		domain_product_slug: domainProductSlug,
		theme,
		intent,
		starting_point: startingPoint,
		is_transfer: isTransfer,
		is_mapping: isMapping,
		signup_domain_origin: signupDomainOrigin,
		framework,
		goals,
	} );

	// Google Analytics
	const flags = [
		isNewUser && 'is_new_user',
		isNewSite && 'is_new_site',
		hasCartItems && 'has_cart_items',
	].filter( Boolean );

	// Google Analytics
	gaRecordEvent( 'Signup', 'calypso_signup_complete:' + flags.join( ',' ) );

	// Tracks, Google Analytics
	if ( isNewSite && isNewUser ) {
		const device = resolveDeviceTypeByViewPort();

		// Tracks
		recordTracksEvent( 'calypso_new_user_site_creation', {
			flow,
			device,
			framework,
		} );
		// Google Analytics
		gaRecordEvent( 'Signup', 'calypso_new_user_site_creation' );
	}

	// Marketing
	adTrackSignupComplete( { isNewUserSite: isNewUser && isNewSite } );
}

export function recordSignupStep( flow, step, optionalProps ) {
	const device = resolveDeviceTypeByViewPort();
	const props = {
		flow,
		step,
		device,
		...optionalProps,
	};

	signupDebug( 'recordSignupStep:', props );

	// Tracks
	recordTracksEvent( 'calypso_signup_step_start', props );
}

export function recordSignupInvalidStep( flow, step ) {
	recordTracksEvent( 'calypso_signup_goto_invalid_step', { flow, step } );
}

/**
 * Records registration event.
 * @param {Object} param {}
 * @param {Object} param.userData User data
 * @param {string} param.flow Registration flow
 * @param {string} param.type Registration type
 */
export function recordRegistration( { userData, flow, type } ) {
	const device = resolveDeviceTypeByViewPort();

	signupDebug( 'recordRegistration:', { userData, flow, type } );

	// Tracks user identification
	identifyUser( userData );
	// Tracks
	recordTracksEvent( 'calypso_user_registration_complete', { flow, type, device } );
	// Google Analytics
	gaRecordEvent( 'Signup', 'calypso_user_registration_complete' );
	// Marketing
	adTrackRegistration();
}

/**
 * Records loading of the processing screen
 * @param {string} flow Signup flow name
 * @param {string} previousStep The step before the processing screen
 * @param {Object} optionalProps Extra properties to record
 */
export function recordSignupProcessingScreen( flow, previousStep, optionalProps ) {
	const device = resolveDeviceTypeByViewPort();
	recordTracksEvent( 'calypso_signup_processing_screen_show', {
		flow,
		previous_step: previousStep,
		device,
		...optionalProps,
	} );
}

/**
 * Records plan change in signup flow
 * @param {string} flow Signup flow name
 * @param {string} step The step when the user changes the plan
 * @param {string} previousPlanName The plan name before changing
 * @param {string} previousPlanSlug The plan slug before changing
 * @param {string} currentPlanName The plan name after changing
 * @param {string} currentPlanSlug The plan slug after changing
 */
export const recordSignupPlanChange = (
	flow,
	step,
	previousPlanName,
	previousPlanSlug,
	currentPlanName,
	currentPlanSlug
) => {
	const device = resolveDeviceTypeByViewPort();

	recordTracksEvent( 'calypso_signup_plan_change', {
		flow,
		step,
		device,
		previous_plan_name: previousPlanName,
		previous_plan_slug: previousPlanSlug,
		current_plan_name: currentPlanName,
		current_plan_slug: currentPlanSlug,
	} );
};
