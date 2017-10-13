/**
 * Internal dependencies
 *
 * @format
 */

import { combineReducers } from 'state/utils';
import wcApi from './wc-api/reducer';

export default combineReducers( {
	wcApi,
} );
