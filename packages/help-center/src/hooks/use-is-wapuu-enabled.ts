/* eslint-disable no-restricted-imports */
import useChatStatus from './use-chat-status';

/**
 * Helper hook to determine if Wapuu should be enabled.
 * @returns {boolean} Whether Wapuu should be enabled or not.
 * @example
 * const isWapuuEnabled = useIsWapuuEnabled();
 * if ( isWapuuEnabled ) {
 *     // Do something
 * }
 */
export const useIsWapuuEnabled = () => {
	const { wapuuAssistantEnabled } = useChatStatus();
	return wapuuAssistantEnabled;
};
