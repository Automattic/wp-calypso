/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	chatStatus,
	connectionError,
	connectionStatus,
	geoLocation,
	isAvailable,
	lastActivityTimestamp,
	lostFocusAt,
	message,
	timeline,
} from './reducers';
import ui from './ui/reducer';

export default combineReducers( {
	chatStatus,
	connectionError,
	connectionStatus,
	geoLocation,
	isAvailable,
	lastActivityTimestamp,
	lostFocusAt,
	message,
	timeline,
	ui,
} );
