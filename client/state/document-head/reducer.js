/**
 * Internal dependencies
 */
import { combineReducers, createReducerWithValidation } from 'state/utils';
import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET,
	ROUTE_SET,
} from 'state/action-types';
import { titleSchema, unreadCountSchema, linkSchema, metaSchema } from './schema';

/**
 * Constants
 */
export const DEFAULT_META_STATE = [ { property: 'og:site_name', content: 'WordPress.com' } ];

export const title = createReducerWithValidation(
	'',
	{
		[ DOCUMENT_HEAD_TITLE_SET ]: ( state, action ) => action.title,
	},
	titleSchema
);

export const unreadCount = createReducerWithValidation(
	0,
	{
		[ DOCUMENT_HEAD_UNREAD_COUNT_SET ]: ( state, action ) => action.count,
		[ ROUTE_SET ]: () => 0,
	},
	unreadCountSchema
);

export const meta = createReducerWithValidation(
	DEFAULT_META_STATE,
	{
		[ DOCUMENT_HEAD_META_SET ]: ( state, action ) => action.meta,
	},
	metaSchema
);

export const link = createReducerWithValidation(
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
	unreadCount,
} );
