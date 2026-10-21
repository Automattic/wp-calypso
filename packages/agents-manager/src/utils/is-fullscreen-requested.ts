import { isReaderChatAgent } from './is-reader-chat-agent';

// Keep the entry URL for this page load; host navigation may remove its query.
const initialSearch = typeof window === 'undefined' ? '' : window.location.search;

export function isFullscreenRequested( agentId?: string, search: string = initialSearch ): boolean {
	return (
		! isReaderChatAgent( agentId ) && new URLSearchParams( search ).get( 'am-fullscreen' ) === '1'
	);
}
