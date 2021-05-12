/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import wcApi from './wc-api/reducer';

export default combineReducers( {
	wcApi,
} );
