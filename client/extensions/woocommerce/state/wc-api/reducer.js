/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import siteData from './site-data/reducer';

const reducers = {
	siteData,
};

export default combineReducers( reducers );
