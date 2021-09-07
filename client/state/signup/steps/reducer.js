import { combineReducers } from 'calypso/state/utils';
import designType from './design-type/reducer';
import siteGoals from './site-goals/reducer';
import siteStyle from './site-style/reducer';
import siteTitle from './site-title/reducer';
import siteType from './site-type/reducer';
import siteVertical from './site-vertical/reducer';
import survey from './survey/reducer';
import userExperience from './user-experience/reducer';

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
