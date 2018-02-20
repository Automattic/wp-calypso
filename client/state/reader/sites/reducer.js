/** @format */
/**
 * External Dependencies
 */
import { assign, includes, keyBy, map, omit, omitBy, reduce, trim } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	READER_SITE_REQUEST,
	READER_SITE_REQUEST_SUCCESS,
	READER_SITE_REQUEST_FAILURE,
	READER_SITE_UPDATE,
	SERIALIZE,
} from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';
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

export const items = createReducer(
	{},
	{
		[ SERIALIZE ]: handleSerialize,
		[ READER_SITE_REQUEST_SUCCESS ]: handleRequestSuccess,
		[ READER_SITE_REQUEST_FAILURE ]: handleRequestFailure,
		[ READER_SITE_UPDATE ]: handleSiteUpdate,
	},
	readerSitesSchema
);

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

export const lastFetched = createReducer(
	{},
	{
		[ READER_SITE_REQUEST_SUCCESS ]: ( state, action ) => ( {
			...state,
			[ action.payload.ID ]: Date.now(),
		} ),
		[ READER_SITE_UPDATE ]: ( state, action ) => {
			const updates = reduce(
				action.payload,
				( memo, site ) => {
					memo[ site.ID ] = Date.now();
					return memo;
				},
				{}
			);
			return assign( {}, state, updates );
		},
	}
);

export default combineReducers( {
	items,
	queuedRequests,
	lastFetched,
} );
