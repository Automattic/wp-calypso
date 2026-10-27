import { dispatch } from '@wordpress/data';
import { getActiveSessionId } from './agent-session';
import { getAgentsManagerInlineData } from './get-agents-manager-inline-data';
import { getSiteUrl } from './site-url';
import type { HelpCenterDispatch } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';
// What support sees when the agent composed no summary.
const DEFAULT_MESSAGE = 'The user asked to talk to a human.';
// The flow Zendesk routes the chat on, and the provider Odie ties its session to.
const ZENDESK_FLOW_NAME = 'big-sky-human-support';
const EXTERNAL_CHAT_PROVIDER = 'agents-manager';

/**
 * Opens the Help Center on a support chat prefilled with `message`, tied to
 * this chat's session. Returns whether the Help Center was there to open.
 */
export function openHelpCenterChat( message?: string ): boolean {
	// eslint-disable-next-line @wordpress/data-no-store-string-literals
	const helpCenter = dispatch( HELP_CENTER_STORE ) as
		Partial< HelpCenterDispatch[ 'dispatch' ] > | undefined;

	if ( ! helpCenter?.setShowHelpCenter || ! helpCenter.setNewMessagingChat ) {
		return false;
	}

	const site = getAgentsManagerInlineData()?.site;
	const sessionId = getActiveSessionId();

	// Premium support is what lets the Help Center forward the chat from Odie
	// to a human.
	helpCenter.setShowHelpCenter( true, {
		hasPremiumSupport: true,
		hideBackButton: false,
		contextTerm: '',
	} );
	helpCenter.setNewMessagingChat( {
		initialMessage: message?.trim() || DEFAULT_MESSAGE,
		// Only what is known: the Help Center falls back to its own site otherwise.
		...( site && { siteUrl: getSiteUrl( site ) } ),
		...( site?.ID && { siteId: String( site.ID ) } ),
		userFieldFlowName: ZENDESK_FLOW_NAME,
		externalChatProvider: EXTERNAL_CHAT_PROVIDER,
		...( sessionId && { externalChatId: sessionId } ),
	} );

	return true;
}
