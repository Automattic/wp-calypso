/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'client/state/utils';
import wcApi from './wc-api/reducer';

export default combineReducers( {
	wcApi,
} );
