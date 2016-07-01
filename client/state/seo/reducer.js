import { combineReducers } from 'redux';

import { createReducer } from '../utils';
import { SEO_TITLE_SET } from 'state/action-types';

import { titleFormatSchema } from './schema';

const initialTitleFormats = {
	frontPage: '%site_name% | %tagline%',
	posts: '%post_title% - %site_name%',
	pages: '%page_title% - %site_name%',
	groups: '%site_name% > %group_title%',
	archives: '%site_name% (%date%)'
};

const titleFormats = createReducer( initialTitleFormats, {
	[ SEO_TITLE_SET ]: ( state, { pageType, format } ) => Object.assign( {}, state, { [ pageType ]: format } )
}, titleFormatSchema );

export default combineReducers( {
	titleFormats
} );
