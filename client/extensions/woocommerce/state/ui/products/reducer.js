/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'state/utils';
import edits from './edits-reducer';
import list from './list-reducer';
import variations from './variations/reducer';
import apiPlan from './api-plan/reducer';

export default keyedReducer( 'siteId', combineReducers( {
	list,
	edits,
	variations,
	apiPlan,
} ) );
