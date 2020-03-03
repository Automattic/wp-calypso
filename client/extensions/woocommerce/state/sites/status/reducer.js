/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import wcApi from './wc-api/reducer';

export default combineReducers( {
	wcApi,
} );
