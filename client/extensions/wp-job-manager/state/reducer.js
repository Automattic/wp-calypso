/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import settings from './settings/reducer';
import setup from './setup/reducer';

export default combineReducers( { settings, setup } );
