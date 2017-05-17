/**
 * Internal dependencies
 */
import ui from './ui/reducer';
import { combineReducers } from 'state/utils';
import wcApi from './wc-api/reducer';
import site from './site/reducer';

export default combineReducers( {
	ui,
	wcApi,
	site,
} );
