import { combineReducers } from 'redux';

import { createReducer } from 'state/utils';
import { SEO_TITLE_SET } from 'state/action-types';

import { titleFormatSchema } from './schema';

export const titleFormats = createReducer( {}, {
	[ SEO_TITLE_SET ]: ( state, { siteId, pageType, format } ) => ( {
		...state,
		[ siteId ]: {
			...state[ siteId ],
			[ pageType ]: format
		}
	} )
}, titleFormatSchema );

export default combineReducers( {
	titleFormats
} );
