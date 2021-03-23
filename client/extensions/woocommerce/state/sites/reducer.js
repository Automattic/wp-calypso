/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';
import data from './data/reducer';
import meta from './meta/reducer';
import setupChoices from './setup-choices/reducer';
import settings from './settings/reducer';
import status from './status/reducer';

const reducer = combineReducers( {
	data,
	meta,
	setupChoices,
	settings,
	status,
} );

export default keyedReducer( 'siteId', reducer );
