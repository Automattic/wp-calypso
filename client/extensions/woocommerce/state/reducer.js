/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';

export default combineReducers( {
	ui,
	sites,
} );
