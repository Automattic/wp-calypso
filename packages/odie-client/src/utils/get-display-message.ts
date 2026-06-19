import {
	getOdieForwardToForumsMessage,
	getOdieForwardToZendeskMessage,
	getOdieThirdPartyMessageContent,
	getOdieEmailFallbackMessageContent,
	getOdieErrorMessage,
	getOdieErrorMessageNonEligible,
} from '../constants';

/**
 * Decides which message to show for a "talk to human" / human-support escalation
 * when the conversation has not been handed off to a live Zendesk agent yet.
 *
 * Note on the chat-not-loaded branch: when a paid-eligible user has the live chat
 * SDK fail to initialize (`isChatLoaded` stays false after an attempt), the most
 * common real-world cause is 3rd-party cookies being blocked — Smooch.init() throws
 * and never flips `isChatLoaded` to true. The `canConnectToZendesk` ping
 * (`/embeddable/config`) succeeds even with cookies blocked, so it can't catch this
 * case on its own. We therefore route a paid user whose chat couldn't load to the
 * "enable 3rd-party cookies" guidance instead of a generic connection error.
 */
export const getDisplayMessage = (
	userHasRecentOpenConversation: boolean,
	isUserEligibleForPaidSupport: boolean,
	canConnectToZendesk: boolean,
	forceEmailSupport?: boolean,
	isChatRestricted?: boolean,
	isErrorMessage?: boolean,
	isChatLoaded?: boolean
) => {
	if ( isUserEligibleForPaidSupport && ! canConnectToZendesk ) {
		return getOdieThirdPartyMessageContent();
	}

	if ( isUserEligibleForPaidSupport && forceEmailSupport ) {
		return getOdieEmailFallbackMessageContent( isChatRestricted );
	}

	if ( isErrorMessage && ! isUserEligibleForPaidSupport ) {
		return getOdieErrorMessageNonEligible();
	}

	const forwardMessage = isUserEligibleForPaidSupport
		? getOdieForwardToZendeskMessage( userHasRecentOpenConversation )
		: getOdieForwardToForumsMessage();

	if ( isErrorMessage ) {
		return getOdieErrorMessage();
	}

	// Paid-eligible user, but the live chat SDK never finished initializing. The
	// dominant cause is blocked 3rd-party cookies (Smooch.init() throws), which the
	// `canConnectToZendesk` config ping cannot detect. Surface the cookie guidance
	// rather than a generic "couldn't connect" error so the user has an actionable
	// next step. This intentionally also covers rarer transient/network init failures
	// — see false-positive note in the PR.
	if ( isUserEligibleForPaidSupport && ! isChatLoaded ) {
		return getOdieThirdPartyMessageContent();
	}

	return forwardMessage;
};
