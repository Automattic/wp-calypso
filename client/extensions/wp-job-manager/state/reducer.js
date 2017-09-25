/**
 * Internal dependencies
 */
import settings from './settings/reducer';
import setup from './setup/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( { settings, setup } );
