/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	chatStatus,
	connectionError,
	connectionStatus,
	isAvailable,
	lastActivityTimestamp,
	lostFocusAt,
	message,
	timeline,
	geoLocation,
} from './reducers';

export default combineReducers( {
	chatStatus,
	connectionError,
	connectionStatus,
	isAvailable,
	lastActivityTimestamp,
	lostFocusAt,
	message,
	timeline,
	geoLocation,
} );
