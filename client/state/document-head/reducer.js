/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation } from 'state/utils';
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

export const title = withSchemaValidation( titleSchema, ( state = '', action ) => {
	switch ( action.type ) {
		case DOCUMENT_HEAD_TITLE_SET:
			return action.title;
	}

	return state;
} );

export const unreadCount = withSchemaValidation( unreadCountSchema, ( state = 0, action ) => {
	switch ( action.type ) {
		case DOCUMENT_HEAD_UNREAD_COUNT_SET:
			return action.count;
		case ROUTE_SET:
			return 0;
	}

	return state;
} );

export const meta = withSchemaValidation( metaSchema, ( state = DEFAULT_META_STATE, action ) => {
	switch ( action.type ) {
		case DOCUMENT_HEAD_META_SET:
			return action.meta;
	}

	return state;
} );

export const link = withSchemaValidation( linkSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case DOCUMENT_HEAD_LINK_SET:
			return action.link;
	}

	return state;
} );

export default combineReducers( {
	link,
	meta,
	title,
	unreadCount,
} );
