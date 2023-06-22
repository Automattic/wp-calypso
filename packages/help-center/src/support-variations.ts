export const SUPPORT_CHAT_OVERFLOW = 'SUPPORT_CHAT_OVERFLOW';
export const SUPPORT_FORUM = 'SUPPORT_FORUM';
export const SUPPORT_CHAT = 'SUPPORT_CHAT';
export const SUPPORT_TICKET = 'SUPPORT_TICKET';
export const SUPPORT_UPWORK_TICKET = 'SUPPORT_UPWORK_TICKET';

/**
 * @param {string} mode Help Center contact form mode
 * @returns {string} One of the exported support variation constants listed above
 */
export const getSupportVariationFromMode = ( mode: 'CHAT' | 'EMAIL' | 'FORUM' | 'UPWORK' ) => {
	switch ( mode ) {
		case 'CHAT':
			return SUPPORT_CHAT;
		case 'EMAIL':
			return SUPPORT_TICKET;
		case 'FORUM':
			return SUPPORT_FORUM;
		case 'UPWORK':
			return SUPPORT_UPWORK_TICKET;
	}
};
