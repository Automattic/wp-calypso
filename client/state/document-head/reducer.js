/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	DOCUMENT_HEAD_LINK_ADD,
	DOCUMENT_HEAD_META_ADD,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET,
} from 'state/action-types';
import { titleSchema, unreadCountSchema, linkSchema, metaSchema } from './schema';

export const title = createReducer( '', {
	[ DOCUMENT_HEAD_TITLE_SET ]: ( state, action ) => ( action.title )
}, titleSchema );

export const unreadCount = createReducer( 0, {
	[ DOCUMENT_HEAD_UNREAD_COUNT_SET ]: ( state, action ) => ( action.count )
}, unreadCountSchema );

export const meta = createReducer( [ { property: 'og:site_name', content: 'WordPress.com' } ], {
	[ DOCUMENT_HEAD_META_ADD ]: ( state, action ) => ( [ ...state, action.meta ] )
}, metaSchema );

export const link = createReducer( [], {
	[ DOCUMENT_HEAD_LINK_ADD ]: ( state, action ) => ( [ ...state, action.link ] )
}, linkSchema );

export default combineReducers( {
	link,
	meta,
	title,
	unreadCount
} );
