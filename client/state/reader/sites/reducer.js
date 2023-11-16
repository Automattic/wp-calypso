import { includes, keyBy, omit, omitBy } from 'lodash';
import { decodeEntities } from 'calypso/lib/formatting';
import { withoutHttp } from 'calypso/lib/url';
import {
	READER_SITE_BLOCKS_RECEIVE,
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
} from 'calypso/state/reader/action-types';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { readerSitesSchema } from './schema';

function handleRequestFailure( state, action ) {
	// 410 means site moved - site used to be on wpcom but is no longer
	const handledStatusCodes = [ 403, 404, 410 ];

	if ( action.error && ! includes( handledStatusCodes, action.error.statusCode ) ) {
		return state;
	}

	return {
		...state,
		[ action.payload.ID ]: {
			ID: action.payload.ID,
			is_error: true,
			error: action.error,
		},
	};
}

function adaptSite( attributes ) {
	// this also ends up cloning attributes, which is important since we mutate it
	attributes = omit( attributes, [ 'meta', 'subscription' ] );

	if ( attributes.URL ) {
		attributes.domain = withoutHttp( attributes.URL );
		attributes.slug = attributes.domain.replace( /\//g, '::' );
	}
	attributes.title =
		( typeof attributes.name === 'string' && attributes.name.trim() ) || attributes.domain;

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
	return {
		...state,
		[ action.payload.ID ]: site,
	};
}

const itemsReducer = ( state = {}, action ) => {
	switch ( action.type ) {
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
	}

	return state;
};
export const items = withSchemaValidation(
	readerSitesSchema,
	withPersistence( itemsReducer, {
		// remove errors from the serialized state
		serialize: ( state ) => omitBy( state, 'is_error' ),
	} )
);

export function queuedRequests( state = {}, action ) {
	switch ( action.type ) {
		case READER_SITE_REQUEST:
			return {
				...state,
				[ action.payload.ID ]: true,
			};
		case READER_SITE_REQUEST_SUCCESS:
		case READER_SITE_REQUEST_FAILURE:
			return omit( state, action.payload.ID );
	}
	return state;
}

export const lastFetched = ( state = {}, action ) => {
	switch ( action.type ) {
		case READER_SITE_REQUEST_SUCCESS:
			return {
				...state,
				[ action.payload.ID ]: Date.now(),
			};
	}

	return state;
};

export default combineReducers( {
	items,
	queuedRequests,
	lastFetched,
} );
