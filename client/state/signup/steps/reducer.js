/** @format */

/**
 * Internal dependencies
 */

import designType from './design-type/reducer';
import siteTitle from './site-title/reducer';
import siteGoals from './site-goals/reducer';
import userExperience from './user-experience/reducer';
import { combineReducers } from 'client/state/utils';
import survey from './survey/reducer';

export default combineReducers( {
	designType,
	siteTitle,
	siteGoals,
	userExperience,
	survey,
} );
