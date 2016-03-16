/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	PAGE_LINK_ADD,
	PAGE_META_ADD,
	PAGE_TITLE_SET,
	PAGE_UNREAD_COUNT_SET,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function title( state = '', action ) {
	switch ( action.type ) {
		case PAGE_TITLE_SET:
			return action.title;
	}

	return state;
}

export function unreadCount( state = 0, action ) {
	switch ( action.type ) {
		case PAGE_UNREAD_COUNT_SET:
			return action.count;
	}

	return state;
}

export function meta( state = [], action ) {
	switch ( action.type ) {
		case PAGE_META_ADD:
			return [ ...state, action.meta ];
	}

	return state;
}

export function link( state = [], action ) {
	switch ( action.type ) {
		case PAGE_LINK_ADD:
			return [ ...state, action.link ];
	}

	return state;
}

const reducer = combineReducers( {
	link,
	meta,
	title,
	unreadCount
} );

export default function( state, action ) {
	if ( SERIALIZE === action.type || DESERIALIZE === action.type ) {
		return {};
	}

	return reducer( state, action );
}
