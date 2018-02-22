/** @format */

/**
 * Internal dependencies
 */

import designType from './design-type/reducer';
import domains from './domains/reducer';
import siteTitle from './site-title/reducer';
import siteGoals from './site-goals/reducer';
import siteGoalsArray from './site-goals-array/reducer';
import userExperience from './user-experience/reducer';
import { combineReducers } from 'state/utils';
import survey from './survey/reducer';

export default combineReducers( {
	designType,
	domains,
	siteTitle,
	siteGoals,
	siteGoalsArray,
	userExperience,
	survey,
} );
