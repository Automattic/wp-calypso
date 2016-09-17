/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOAD_STATUS } from './constants';
import { shortcodesSchema } from './schema';
import {
	SHORTCODE_FETCH,
	SHORTCODE_RECEIVE
} from 'state/action-types';

const siteShortcode = ( state = {}, { type, error, data } ) => {
	switch ( type ) {
		case SHORTCODE_FETCH:
			return { ...state, ...{ status: LOAD_STATUS.LOADING } };
		case SHORTCODE_RECEIVE:
			if ( error ) {
				return { ...state, ...{ status: LOAD_STATUS.ERROR } };
			}

			const { scripts, styles } = data;
			const body = data.result;
			const status = LOAD_STATUS.LOADED;

			return { ...state, ...{ body, scripts, styles, status } };
	}

	return state;
};

const siteShortcodes = ( state = {}, action ) => {
	switch ( action.type ) {
		case SHORTCODE_FETCH:
		case SHORTCODE_RECEIVE:
			const { shortcode } = action;
			return { ...state, ...{ [ shortcode ]: siteShortcode( state[ shortcode ] || {}, action ) } };
	}

	return state;
};

const shortcodes = ( state = {}, action ) => {
	const { siteId } = action;
	return ( { ...state, ...{ [ siteId ]: siteShortcodes( state[ siteId ] || {}, action ) } } );
};

export default createReducer( {}, {
	[ SHORTCODE_FETCH ]: shortcodes,
	[ SHORTCODE_RECEIVE ]: shortcodes
}, shortcodesSchema );
