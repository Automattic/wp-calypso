/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import dependencyStore from './dependency-store/reducer';
import progress from './progress/reducer';
import optionalDependencies from './optional-dependencies/reducer';
import steps from './steps/reducer';
import flow from './flow/reducer';
import verticals from './verticals/reducer';

import { SIGNUP_STEPS_SITE_STYLE_UPDATE_PREVIEW } from 'state/action-types';

export default combineReducers( {
	dependencyStore,
	optionalDependencies,
	progress,
	steps,
	flow,
	verticals,
	siteMockupShown: createReducer( null, {
		[ SIGNUP_STEPS_SITE_STYLE_UPDATE_PREVIEW ]: () => new Date().getTime(),
	} ),
} );
