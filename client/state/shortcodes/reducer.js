/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { LOAD_STATUS } from './constants';
import {
	SHORTCODE_FETCH,
	SHORTCODE_RECEIVE
} from 'state/action-types';

const siteShortcode = createReducer( {}, {
	[ SHORTCODE_FETCH ]: ( state ) => {
		return { ...state, ...{ status: LOAD_STATUS.LOADING } };
	},
	[ SHORTCODE_RECEIVE ]: ( state, { error, data } ) => {
		const { scripts, styles } = data;
		const body = data.result;
		const status = error ? LOAD_STATUS.ERROR : LOAD_STATUS.LOADED;

		return { ...state, ...{ body, scripts, styles, status } };
	},
} );

const siteShortcodes = ( state = {}, action ) => {
	switch ( action.type ) {
		case SHORTCODE_FETCH:
		case SHORTCODE_RECEIVE:
			const { shortcode } = action;
			return { ...state, ...{ [ shortcode ]: siteShortcode( state[ shortcode ] || {}, action ) } };
	}

	return state;
};

export default ( state = {}, action ) => {
	switch ( action.type ) {
		case SHORTCODE_FETCH:
		case SHORTCODE_RECEIVE:
			const { siteId } = action;
			return { ...state, ...{ [ siteId ]: siteShortcodes( state[ siteId ] || {}, action ) } };
	}

	return state;
};
