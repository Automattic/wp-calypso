/** @format */

/**
 * Internal dependencies
 */

import designType from './design-type/reducer';
import siteTitle from './site-title/reducer';
import siteInformation from './site-information/reducer';
import siteGoals from './site-goals/reducer';
import userExperience from './user-experience/reducer';
import siteType from './site-type/reducer';
import siteVertical from './site-vertical/reducer';
import { combineReducers } from 'state/utils';
import survey from './survey/reducer';

export default combineReducers( {
	designType,
	siteTitle,
	siteInformation,
	siteGoals,
	userExperience,
	siteType,
	siteVertical,
	survey,
} );
