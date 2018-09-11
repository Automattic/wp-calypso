/** @format */

/**
 * Internal dependencies
 */

import { SITE_NUDGE_CLICK_REQUEST, SITE_NUDGE_CLICK_RECEIVE } from 'state/action-types';

export const nudgeClickRequest = ( siteId, nudgeName ) => {
	return {
		type: SITE_NUDGE_CLICK_REQUEST,
		payload: {
			siteId,
			nudgeName,
		},
	};
};

export const nudgeClickReceive = apiResponse => {
	return {
		type: SITE_NUDGE_CLICK_RECEIVE,
		apiResponse,
	};
};
