import { createSelector } from '@automattic/state-utils';

import 'calypso/state/notices/init';

const EMPTY_ARRAY = [];

/**
 * Returns array value of notice item state
 *
 * @param  {object} state Global state tree
 * @returns {Array}        Notice objects as array
 */
export const getNotices = createSelector(
	( state ) => {
		const notices = Object.values( state.notices.items );
		if ( ! notices.length ) {
			return EMPTY_ARRAY;
		}
		return notices;
	},
	( state ) => state.notices.items
);

export const getNoticeLastTimeShown = createSelector(
	( state, noticeId ) => state.notices.lastTimeShown[ noticeId ] || 0,
	( state ) => state.notices.lastTimeShown
);
