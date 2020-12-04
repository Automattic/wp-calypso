/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import taxrates from './taxrates/reducer';

export default combineReducers( {
	taxrates,
} );
