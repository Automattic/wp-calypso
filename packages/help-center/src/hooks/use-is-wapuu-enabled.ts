/* eslint-disable no-restricted-imports */
import config from '@automattic/calypso-config';
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
	// A way to enable it via flag
	const isWapuuConfigEnabled = config.isEnabled( 'wapuu' );
	return wapuuAssistantEnabled || isWapuuConfigEnabled;
};
