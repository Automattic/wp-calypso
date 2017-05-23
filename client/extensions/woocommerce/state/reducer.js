/**
 * Internal dependencies
 */
import ui from './ui/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import wcApi from './wc-api/reducer';

export default combineReducersWithPersistence( {
	ui,
	wcApi,
} );
