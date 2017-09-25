/** @format */
/**
 * External dependencies
 */
import { assign, keyBy, map, omit, omitBy, reduce, trim } from 'lodash';

/**
 * Internal dependencies
 */
import { readerSitesSchema } from './schema';
import { decodeEntities } from 'lib/formatting';
import { withoutHttp } from 'lib/url';
import { READER_SITE_REQUEST, READER_SITE_REQUEST_SUCCESS, READER_SITE_REQUEST_FAILURE, READER_SITE_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { combineReducers, createReducer, isValidStateWithSchema } from 'state/utils';

const actionMap = {
	[ SERIALIZE ]: handleSerialize,
	[ DESERIALIZE ]: handleDeserialize,
	[ READER_SITE_REQUEST_SUCCESS ]: handleRequestSuccess,
	[ READER_SITE_REQUEST_FAILURE ]: handleRequestFailure,
	[ READER_SITE_UPDATE ]: handleSiteUpdate,
};

function defaultHandler( state ) {
	return state;
}

function handleSerialize( state ) {
	// remove errors from the serialized state
	return omitBy( state, 'is_error' );
}

function handleDeserialize( state ) {
	if ( isValidStateWithSchema( state, readerSitesSchema ) ) {
		return state;
	}
	return {};
}

function handleRequestFailure( state, action ) {
	// new object proceeds current state to prevent new errors from overwriting existing values
	return assign(
		{
			[ action.payload.ID ]: {
				ID: action.payload.ID,
				is_error: true,
			},
		},
		state
	);
}

function adaptSite( attributes ) {
	// this also ends up cloning attributes, which is important since we mutate it
	attributes = omit( attributes, [ 'meta' ] );

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

export function items( state = {}, action ) {
	const handler = actionMap[ action.type ] || defaultHandler;
	return handler( state, action );
}
items.hasCustomPersistence = true;

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
