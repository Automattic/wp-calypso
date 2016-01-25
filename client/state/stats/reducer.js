/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { SITE_STATS_REQUEST, SITE_STATS_REQUEST_FAILURE, SITE_STATS_RECEIVE } from 'state/action-types';
import { isPostIdEndpoint } from 'lib/stats/endpoints';
import { getCompositeKey } from './utils';
import statsParserFactory from 'lib/stats/stats-list/stats-parser';
const statsParser = statsParserFactory();

function parseAction( action ) {
	const { domain, options, postID, response, siteID, statType } = action;
	const _siteID = parseInt( siteID, 10 );

	if ( ! _siteID || domain ) {
		throw new Error( 'Site stats actions require a siteID or domain' );
	}

	const _options = isPostIdEndpoint( statType )
		? { post: postID || options }
		: options;

	return {
		domain,
		options: _options,
		postID: parseInt( isPostIdEndpoint( statType ) ? options : postID, 10 ) || 0,
		siteID: _siteID,
		response,
		statType
	}
}

/**
 * Tracks all known stats items via composite key
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_STATS_RECEIVE:
			const parsedAction = parseAction( action );
			const { response, statType } = parsedAction;

			// simulate the "this" context in the StatsList
			// @TODO change the response parsers to take arguments instead of throwing contxt around
			const parsedResponse = typeof statsParser[statType] === 'function'
				? statsParser[statType].call( parsedAction, response )
				: response;

			const receiveItemsKey = getCompositeKey( parsedAction );
			return Object.assign( {}, state, {
				[ receiveItemsKey ]: parsedResponse
			} );
		default:
			return state;
	}
}

export function fetchingItems( state = {}, action ) {
	let newState;

	switch ( action.type ) {
		case SITE_STATS_REQUEST_FAILURE:
		case SITE_STATS_RECEIVE:
			newState = Object.assign( {}, state );
			delete newState[ getCompositeKey( action ) ];
			return newState;
		case SITE_STATS_REQUEST:
			newState = Object.assign( {}, state, {
				[ getCompositeKey( action.data ) ]: true
			} );
			return newState;
		default:
			return state;
	}
}

export default combineReducers( {
	items,
	fetchingItems
} );
