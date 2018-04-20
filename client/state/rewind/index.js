/** @format */
/**
 * Internal dependencies
 */
import { REWIND_ALERT_UPDATE, REWIND_STATE_UPDATE } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const rewindAlertsItem = ( state = null, { type, alerts } ) =>
	type === REWIND_ALERT_UPDATE ? alerts : state;

export const rewindAlerts = keyedReducer( 'siteId', rewindAlertsItem );

export const rewindItem = ( state = null, { type, data } ) =>
	type === REWIND_STATE_UPDATE ? data : state;

export const rewindReducer = keyedReducer( 'siteId', rewindItem );
