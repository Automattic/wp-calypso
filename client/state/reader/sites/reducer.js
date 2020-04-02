/**
 * External Dependencies
 */
import { assign, includes, keyBy, map, omit, omitBy, reduce, trim } from 'lodash';

/**
 * Internal Dependencies
 */
import { SERIALIZE, SECTION_SET } from 'state/action-types';
import {
	READER_SITE_BLOCKS_RECEIVE,
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
	READER_SITE_UPDATE,
	READER_POST_SEEN,
	READER_STREAMS_VIEW_ITEM,
	READER_STREAMS_UNVIEW_ITEM,
	LASAGNA_SOCKET_DISCONNECTED,
} from 'state/reader/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'state/utils';
import { readerSitesSchema } from './schema';
import { withoutHttp } from 'lib/url';
import { decodeEntities } from 'lib/formatting';

function handleSerialize( state ) {
	// remove errors from the serialized state
	return omitBy( state, 'is_error' );
}

function handleRequestFailure( state, action ) {
	// 410 means site moved - site used to be on wpcom but is no longer
	const handledStatusCodes = [ 403, 404, 410 ];

	if ( action.error && ! includes( handledStatusCodes, action.error.statusCode ) ) {
		return state;
	}

	return assign( {}, state, {
		[ action.payload.ID ]: {
			ID: action.payload.ID,
			is_error: true,
			error: action.error,
		},
	} );
}

function adaptSite( attributes ) {
	// this also ends up cloning attributes, which is important since we mutate it
	attributes = omit( attributes, [ 'meta', 'subscription' ] );

	if ( attributes.URL ) {
		attributes.domain = withoutHttp( attributes.URL );
		attributes.slug = attributes.domain.replace( /\//g, '::' );
	}
	attributes.title = trim( attributes.name ) || attributes.domain;

	if ( attributes.description ) {
		attributes.description = decodeEntities( attributes.description );
	}

	// If a WordPress.com site has a mapped domain create a `wpcom_url`
	// attribute to allow site selection with either domain.
	if ( attributes.options && attributes.options.is_mapped_domain && ! attributes.is_jetpack ) {
		attributes.wpcom_url = withoutHttp( attributes.options.unmapped_url );
	}

	// If a site has an `is_redirect` property use the `unmapped_url`
	// for the slug and domain to match the wordpress.com original site.
	if ( attributes.options && attributes.options.is_redirect ) {
		attributes.slug = withoutHttp( attributes.options.unmapped_url );
		attributes.domain = attributes.slug;
	}
	return attributes;
}

function handleRequestSuccess( state, action ) {
	const site = adaptSite( action.payload );
	// TODO do we need to normalize site entries somehow?
	return assign( {}, state, {
		[ action.payload.ID ]: site,
	} );
}

function handleSiteUpdate( state, action ) {
	const sites = map( action.payload, adaptSite );
	return assign( {}, state, keyBy( sites, 'ID' ) );
}

export const items = withSchemaValidation( readerSitesSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
			return handleSerialize( state, action );
		case READER_SITE_BLOCKS_RECEIVE: {
			if ( ! action.payload || ! action.payload.sites ) {
				return state;
			}

			const newBlocks = keyBy( action.payload.sites, 'ID' );

			// Prefer existing state if we have it - site details provided by blocks are limited (only name, URL)
			return {
				...newBlocks,
				...state,
			};
		}
		case READER_SITE_REQUEST_SUCCESS:
			return handleRequestSuccess( state, action );
		case READER_SITE_REQUEST_FAILURE:
			return handleRequestFailure( state, action );
		case READER_SITE_UPDATE:
			return handleSiteUpdate( state, action );
	}

	return state;
} );

export function queuedRequests( state = {}, action ) {
	switch ( action.type ) {
		case READER_SITE_REQUEST:
			return assign( {}, state, {
				[ action.payload.ID ]: true,
			} );
		case READER_SITE_REQUEST_SUCCESS:
		case READER_SITE_REQUEST_FAILURE:
			return omit( state, action.payload.ID );
		// we intentionally don't update state on READER_SITE_UPDATE because those can't affect inflight requests
	}
	return state;
}

export const lastFetched = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_SITE_REQUEST_SUCCESS:
			return {
				...state,
				[ action.payload.ID ]: Date.now(),
			};
		case READER_SITE_UPDATE: {
			const updates = reduce(
				action.payload,
				( memo, site ) => {
					memo[ site.ID ] = Date.now();
					return memo;
				},
				{}
			);
			return assign( {}, state, updates );
		}
	}

	return state;
} );

export const list = ( state = {}, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case LASAGNA_SOCKET_DISCONNECTED:
			return {};

		case READER_STREAMS_VIEW_ITEM: {
			if ( ! action.payload || ! action.payload.post ) {
				return state;
			}

			const blogId = action.payload.post.site_ID;
			const postId = action.payload.post.ID;
			const postsList = state[ blogId ] ? state[ blogId ] : [];
			postsList.push( postId );
			return {
				...state,
				[ blogId ]: postsList,
			};
		}

		case READER_STREAMS_UNVIEW_ITEM: {
			if ( ! action.payload || ! action.payload.post ) {
				return state;
			}

			const blogId = action.payload.post.site_ID;
			const postId = action.payload.post.ID;
			let postsList = state[ blogId ] ? state[ blogId ].filter( e => e !== postId ) : [];
			postsList = postsList.filter( e => e !== postId );
			return {
				...state,
				[ blogId ]: postsList,
			};
		}
	}

	return state;
};

export const detail = ( state = null, action ) => {
	switch ( action.type ) {
		case SERIALIZE:
		case LASAGNA_SOCKET_DISCONNECTED:
			return null;

		case READER_POST_SEEN: {
			if ( ! action.payload || ! action.payload.post ) {
				return state;
			}

			const blogId = action.payload.post.site_ID;
			return blogId;
		}

		case SECTION_SET: {
			// leave reader full post, clear all viewing
			if ( action.previousSection && action.previousSection.module === 'reader/full-post' ) {
				return null;
			}
		}
	}

	return state;
};

export default combineReducers( {
	items,
	viewing: combineReducers( {
		list,
		detail,
	} ),
	queuedRequests,
	lastFetched,
} );
