export const SUPPORT_FORUM = 'SUPPORT_FORUM';
export const SUPPORT_UPWORK_TICKET = 'SUPPORT_UPWORK_TICKET';

/**
 * @param {string} mode Help Center contact form mode
 * @returns {string} One of the exported support variation constants listed above
 */
export const getSupportVariationFromMode = ( mode: 'FORUM' | 'UPWORK' ) => {
	switch ( mode ) {
		case 'FORUM':
			return SUPPORT_FORUM;
		case 'UPWORK':
			return SUPPORT_UPWORK_TICKET;
	}
};
