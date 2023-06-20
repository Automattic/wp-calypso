import { READER_DISMISS_POST, READER_DISMISS_SITE } from 'calypso/state/reader/action-types';

import 'calypso/state/data-layer/wpcom/me/dismiss/sites/new';

import 'calypso/state/reader/init';

export const dismissPost = ( { streamKey, postKey } ) => {
	return {
		type: READER_DISMISS_POST,
		payload: { streamKey, postKey, siteId: postKey.blogId },
	};
};

export const dismissSite = ( { siteId, seed } ) => {
	return {
		type: READER_DISMISS_SITE,
		payload: { siteId },
		seed,
	};
};
