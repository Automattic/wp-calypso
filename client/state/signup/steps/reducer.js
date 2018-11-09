/** @format */

/**
 * Internal dependencies
 */

import designType from './design-type/reducer';
import siteTitle from './site-title/reducer';
import siteTopic from './site-topic/reducer';
import siteGoals from './site-goals/reducer';
import userExperience from './user-experience/reducer';
import siteType from './site-type/reducer';
import { combineReducers } from 'state/utils';
import survey from './survey/reducer';

export default combineReducers( {
	designType,
	siteTitle,
	siteTopic,
	siteGoals,
	userExperience,
	siteType,
	survey,
} );
