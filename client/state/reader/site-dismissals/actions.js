/** @format */

/**
 * Internal dependencies
 */
import { READER_DISMISS_POST, READER_DISMISS_SITE } from 'state/action-types';

export const dismissPost = ( { streamKey, postKey } ) => {
	return {
		type: READER_DISMISS_POST,
		payload: { streamKey, postKey, siteId: postKey.blogId },
	};
};

export const dismissSite = siteId => {
	return {
		type: READER_DISMISS_SITE,
		payload: { siteId },
	};
};
