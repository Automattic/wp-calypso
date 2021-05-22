/**
 * Internal dependencies
 */

import designType from './design-type/reducer';
import siteTitle from './site-title/reducer';
import siteGoals from './site-goals/reducer';
import userExperience from './user-experience/reducer';
import siteStyle from './site-style/reducer';
import siteType from './site-type/reducer';
import siteVertical from './site-vertical/reducer';
import { combineReducers } from 'calypso/state/utils';
import survey from './survey/reducer';

export default combineReducers( {
	designType,
	siteTitle,
	siteGoals,
	userExperience,
	siteStyle,
	siteType,
	siteVertical,
	survey,
} );
