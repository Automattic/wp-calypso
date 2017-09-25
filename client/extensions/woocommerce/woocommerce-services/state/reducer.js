/**
 * Internal dependencies
 */
import labelSettings from './label-settings/reducer';
import packages from './packages/reducer';
import { combineReducers, keyedReducer } from 'state/utils';

export default keyedReducer( 'siteId', combineReducers( {
	labelSettings,
	packages,
} ) );
