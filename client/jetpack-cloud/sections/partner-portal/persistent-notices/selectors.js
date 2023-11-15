import { createSelector } from '@automattic/state-utils';

import './init';

const EMPTY_ARRAY = [];

/**
 * Returns array value of notice item state
 * @param  {Object} state Global state tree
 * @returns {Array}        Notice objects as array
 */
export const getJetpackManagePersistentNotices = createSelector(
	( state ) => {
		const jetpackManagePersistentNotices = Object.values( state.jetpackManagePersistentNotices );
		if ( ! jetpackManagePersistentNotices.length ) {
			return EMPTY_ARRAY;
		}
		return jetpackManagePersistentNotices;
	},
	( state ) => {
		return state.jetpackManagePersistentNotices;
	}
);
