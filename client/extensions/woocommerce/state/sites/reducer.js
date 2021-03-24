/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';
import setupChoices from './setup-choices/reducer';
import status from './status/reducer';

const reducer = combineReducers( {
	setupChoices,
	status,
} );

export default keyedReducer( 'siteId', reducer );
