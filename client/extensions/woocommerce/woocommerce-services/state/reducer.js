/**
 * External dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';

/**
 * Internal dependencies
 */
import labelSettings from './label-settings/reducer';

export default keyedReducer( 'siteId', combineReducers( {
	labelSettings,
} ) );
