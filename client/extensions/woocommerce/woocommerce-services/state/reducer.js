/**
 * External dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';

/**
 * Internal dependencies
 */
import labelSettings from './label-settings/reducer';
import packages from './packages/reducer';

export default keyedReducer( 'siteId', combineReducers( {
	labelSettings,
	packages,
} ) );
