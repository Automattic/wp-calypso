/**
 * External dependencies
 */
import { keyBy, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import {
	COMMUNITY_TRANSLATOR_TRANSLATION_DATA_REQUEST,
	COMMUNITY_TRANSLATOR_TRANSLATION_DATA_RECEIVE,
} from 'state/action-types';
import { getOriginalKey } from 'components/community-translator/utils';

export const isActive = ( state = false, action ) => {
	return state;
};

export const translations = ( state = {}, action ) => {
	switch ( action.type ) {
		case COMMUNITY_TRANSLATOR_TRANSLATION_DATA_REQUEST: {
			const originalsPlaceholders = mapValues(
				keyBy( action.payload, getOriginalKey ),
				() => ( {} )
			);

			return { ...state, ...originalsPlaceholders };
		}
		case COMMUNITY_TRANSLATOR_TRANSLATION_DATA_RECEIVE: {
			return { ...state, ...action.payload };
		}
	}

	return state;
};

export default combineReducers( {
	isActive,
	translations,
} );
