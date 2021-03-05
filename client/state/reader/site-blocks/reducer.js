/**
 * External dependencies
 */
import { omit, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_SITE_BLOCK,
	READER_SITE_BLOCKS_RECEIVE,
	READER_SITE_BLOCKS_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK,
} from 'calypso/state/reader/action-types';
import { combineReducers, withoutPersistence } from 'calypso/state/utils';

export const items = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_SITE_BLOCK: {
			return {
				...state,
				[ action.payload.siteId ]: true,
			};
		}
		case READER_SITE_UNBLOCK: {
			return omit( state, action.payload.siteId );
		}
		case READER_SITE_REQUEST_SUCCESS: {
			if ( ! action.payload.is_blocked ) {
				if ( ! state[ action.payload.ID ] ) {
					return state;
				}

				return omit( state, action.payload.ID );
			}

			return {
				...state,
				[ action.payload.ID ]: true,
			};
		}
		case READER_SITE_BLOCKS_RECEIVE: {
			if ( ! action.payload || ! action.payload.sites ) {
				return state;
			}

			const newBlocks = reduce(
				action.payload.sites,
				( obj, site ) => {
					obj[ site.ID ] = true;
					return obj;
				},
				{}
			);

			return {
				...state,
				...newBlocks,
			};
		}
	}

	return state;
} );

export const currentPage = withoutPersistence( ( state = 1, action ) => {
	switch ( action.type ) {
		case READER_SITE_BLOCKS_RECEIVE: {
			if ( ! action.payload || ! action.payload.page ) {
				return state;
			}

			return action.payload.page;
		}
	}

	return state;
} );

export const lastPage = withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case READER_SITE_BLOCKS_RECEIVE: {
			if ( ! action.payload || ! action.payload.page || action.payload.count > 0 ) {
				return state;
			}

			return action.payload.page;
		}
	}

	return state;
} );

export const inflightPages = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_SITE_BLOCKS_REQUEST: {
			if ( ! action.payload || ! action.payload.page ) {
				return state;
			}

			return {
				...state,
				[ action.payload.page ]: true,
			};
		}
		case READER_SITE_BLOCKS_RECEIVE: {
			if ( ! action.payload || ! action.payload.page ) {
				return state;
			}

			return omit( state, action.payload.page );
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	currentPage,
	lastPage,
	inflightPages,
} );
