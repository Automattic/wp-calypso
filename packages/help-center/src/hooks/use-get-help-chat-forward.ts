import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT } from '../experiments';

/**
 * Whether this user is in the treatment arm of the "Get Help" chat-forward
 * experiment, which opens the Help Center on the AI chat instead of search.
 * Hosts resolve the assignment; an absent key means it never resolved.
 */
export function useIsGetHelpChatForward(): boolean {
	const { experimentVariations } = useHelpCenterContext();
	return experimentVariations?.[ HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT ] === 'treatment';
}
