/**
 * External dependencies
 */
import { uniqWith, isEqual, isArray } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET,
	ROUTE_SET,
} from 'calypso/state/action-types';
import { titleSchema, unreadCountSchema, linkSchema, metaSchema } from './schema';

/**
 * Constants
 */
export const DEFAULT_META_STATE = config( 'meta' );

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
			if ( ! action.link ) {
				return state;
			}

			// Append action.link to the state array and prevent duplicate objects.
			// Works with action.link being a single link object or an array of link objects.
			return uniqWith(
				[ ...state, ...( isArray( action.link ) ? action.link : [ action.link ] ) ],
				isEqual
			);
	}

	return state;
} );

export default combineReducers( {
	link,
	meta,
	title,
	unreadCount,
} );
