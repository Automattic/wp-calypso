/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';

import 'calypso/state/notices/init';

/**
 * Returns array value of notice item state
 *
 * @param  {object} state Global state tree
 * @returns {Array}        Notice objects as array
 */
export const getNotices = createSelector(
	( state ) => Object.values( state.notices.items ),
	( state ) => state.notices.items
);

export const getNoticeLastTimeShown = createSelector(
	( state, noticeId ) => state.notices.lastTimeShown[ noticeId ] || 0,
	( state ) => state.notices.lastTimeShown
);
