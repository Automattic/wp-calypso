/** @format */

/**
 * Internal dependencies
 */

import { WORDADS_STATUS_REQUEST, WORDADS_STATUS_RECEIVE } from 'state/action-types';
import { pick } from 'lodash';

export const requestWordadsStatus = siteId => dispatch => {
	dispatch( {
		type: WORDADS_STATUS_REQUEST,
		siteId,
	} );
};

export const receiveStatus = siteId => dispatch => {
	dispatch( {
		type: WORDADS_STATUS_RECEIVE,
		siteId,
		status: pick( status, [ 'approved', 'unsafe', 'active' ] ),
	} );
};
