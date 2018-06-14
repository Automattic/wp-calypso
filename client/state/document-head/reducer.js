/** @format */

/**
 * Internal dependencies
 */

import { combineReducers, createReducer } from 'state/utils';
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

export const title = createReducer(
	'',
	{
		[ DOCUMENT_HEAD_TITLE_SET ]: ( state, action ) => action.title,
		[ ROUTE_SET ]: ( state, action ) => {
			return action.isSSR ? state : '';
		},
	},
	titleSchema
);

export const unreadCount = createReducer(
	0,
	{
		[ DOCUMENT_HEAD_UNREAD_COUNT_SET ]: ( state, action ) => action.count,
		[ ROUTE_SET ]: () => 0,
	},
	unreadCountSchema
);

export const meta = createReducer(
	[ { property: 'og:site_name', content: 'WordPress.com' } ],
	{
		[ DOCUMENT_HEAD_META_SET ]: ( state, action ) => action.meta,
		[ ROUTE_SET ]: ( state, action ) => {
			return action.isSSR ? state : DEFAULT_META_STATE;
		},
	},
	metaSchema
);

export const link = createReducer(
	[],
	{
		[ DOCUMENT_HEAD_LINK_SET ]: ( state, action ) => action.link,
		[ ROUTE_SET ]: ( state, action ) => {
			return action.isSSR ? state : [];
		},
	},
	linkSchema
);

export default combineReducers( {
	link,
	meta,
	title,
	unreadCount,
} );
