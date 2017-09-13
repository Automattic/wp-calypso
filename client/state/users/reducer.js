/**
 * Internal dependencies
 */
import config from 'config';
import { withoutHttp } from 'lib/url';
import suggestions from './suggestions/reducer';
import { combineReducers, createReducer } from 'state/utils';
import {
	USER_REQUEST,
	USER_REQUEST_SUCCESS,
	USER_REQUEST_FAILURE,
} from 'state/action-types';
import { usersSchema } from './schema';

/**
 * Module variables
 */
const languages = config( 'languages' );

function getLanguage( slug ) {
	let language;

	for ( let index = 0; index < languages.length; index++ ) {
		if ( slug === languages[ index ].langSlug ) {
			language = languages[ index ];
			break;
		}
	}

	return language;
}

function getSiteSlug( url ) {
	const slug = withoutHttp( url );
	return slug.replace( /\//g, '::' );
}

function getComputedAttributes( attributes ) {
	const language = getLanguage( attributes.language ),
		primayBlogUrl = attributes.primary_blog_url || '';
	return {
		primarySiteSlug: getSiteSlug( primayBlogUrl ),
		localeSlug: attributes.language,
		isRTL: !! ( language && language.rtl )
	};
}

/**
 * Tracks all known user objects, indexed by user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case USER_REQUEST_SUCCESS:
			if ( ! action.user.ID ) {
				return state;
			}
			return Object.assign( {}, state, {
				[ action.user.ID ]: Object.assign( {}, action.user, getComputedAttributes( action.user ) )
			} );
	}

	return state;
}

items.schema = usersSchema;

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer( false, {
	[ USER_REQUEST ]: () => true,
	[ USER_REQUEST_SUCCESS ]: () => false,
	[ USER_REQUEST_FAILURE ]: () => false,
} );

export default combineReducers( {
	items,
	requesting,
	suggestions,
} );
