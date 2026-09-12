export const OPEN_CHAT_URL_PARAM = 'ai-open';

/** Whether the page URL carries `?ai-open=true`, an explicit ask to open the chat. */
export const hasOpenChatUrlParam = () =>
	typeof window !== 'undefined' &&
	new URLSearchParams( window.location.search ).get( OPEN_CHAT_URL_PARAM ) === 'true';
