/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
	ROUTE_SET,
} from 'state/action-types';
import { titleSchema, linkSchema, metaSchema } from './schema';

/**
 * Constants
 */
export const DEFAULT_META_STATE = [ { property: 'og:site_name', content: 'WordPress.com' } ];

export const title = createReducer(
	'',
	{
		[ DOCUMENT_HEAD_TITLE_SET ]: ( state, action ) => action.title,
	},
	titleSchema
);

export const meta = createReducer(
	DEFAULT_META_STATE,
	{
		[ DOCUMENT_HEAD_META_SET ]: ( state, action ) => action.meta,
	},
	metaSchema
);

export const link = createReducer(
	[],
	{
		[ DOCUMENT_HEAD_LINK_SET ]: ( state, action ) => action.link,
	},
	linkSchema
);

export default combineReducers( {
	link,
	meta,
	title,
} );
