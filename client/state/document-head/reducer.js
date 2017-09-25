/**
 * Internal dependencies
 */
import { titleSchema, unreadCountSchema, linkSchema, metaSchema } from './schema';
import { DOCUMENT_HEAD_LINK_SET, DOCUMENT_HEAD_META_SET, DOCUMENT_HEAD_TITLE_SET, DOCUMENT_HEAD_UNREAD_COUNT_SET } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

export const title = createReducer( '', {
	[ DOCUMENT_HEAD_TITLE_SET ]: ( state, action ) => ( action.title )
}, titleSchema );

export const unreadCount = createReducer( 0, {
	[ DOCUMENT_HEAD_UNREAD_COUNT_SET ]: ( state, action ) => ( action.count )
}, unreadCountSchema );

export const meta = createReducer( [ { property: 'og:site_name', content: 'WordPress.com' } ], {
	[ DOCUMENT_HEAD_META_SET ]: ( state, action ) => ( action.meta )
}, metaSchema );

export const link = createReducer( [], {
	[ DOCUMENT_HEAD_LINK_SET ]: ( state, action ) => ( action.link )
}, linkSchema );

export default combineReducers( {
	link,
	meta,
	title,
	unreadCount
} );
