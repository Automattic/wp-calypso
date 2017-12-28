/** @format */

/**
 * External dependencies
 */

import { values } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'client/lib/create-selector';

/**
 * Returns array value of notice item state
 *
 * @param  {Object} state Global state tree
 * @return {Array}        Notice objects as array
 */
export const getNotices = createSelector(
	state => values( state.notices.items ),
	state => state.notices.items
);

export const getNoticeLastTimeShown = createSelector(
	( state, noticeId ) => state.notices.lastTimeShown[ noticeId ] || 0,
	state => state.notices.lastTimeShown
);
