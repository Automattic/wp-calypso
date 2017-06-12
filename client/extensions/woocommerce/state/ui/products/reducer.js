/**
 * Internal dependencies
 */
import edits from './edits-reducer';
import { combineReducers } from 'state/utils';
import variations from './variations/reducer';
import apiPlan from './api-plan/reducer';

export default combineReducers( {
	edits,
	variations,
	apiPlan,
} );
