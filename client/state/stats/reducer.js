/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { merge } from 'lodash/object';

/**
 * Internal dependencies
 */
import { SITE_STATS_REQUEST, SITE_STATS_REQUEST_FAILURE, SITE_STATS_RECEIVE } from 'state/action-types';
import { isPostIdEndpoint } from 'lib/stats/endpoints';
import statsParserFactory from 'lib/stats/stats-list/stats-parser';
const statsParser = statsParserFactory();

export function stringifyOptions( options = {} ) {
	return Object.keys( options ).sort().map( ( key ) => {
		const value = JSON.stringify( options[ key ] );
		return key + ( value ? '=' + value : '' );
	} ).join( '&' );
}

function parseAction( action ) {
	const { options, postID, response, siteID, statType } = action;
	const _siteID = parseInt( siteID, 10 );
	if ( ! _siteID ) {
		throw new Error( 'Site stats actions require a siteID' );
	}
	return {
		postID: parseInt( isPostIdEndpoint( statType ) ? options : postID, 10 ) || 0,
		siteID: _siteID,
		options,
		response,
		statType
	}
}

export function getCompositeKey( action ) {
	const { statType, siteID, postID, options } = parseAction( action );
	const stringifiedOptions = stringifyOptions( options );
	return `${siteID}_${ postID || '*' }_${statType}_${stringifiedOptions}`;
}

/**
 * Tracks all known stats items in a selectably-shaped object
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_STATS_RECEIVE:
			const { options, response, siteID, postID, statType } = parseAction( action );
			const stringifiedOptions = stringifyOptions( options );
			if ( typeof statsParser[statType] === 'function' ) {
				console.log( `would call parser statsParser.${statType}` );
				/*	@TODO Apply statsParser transformations
				siteStats = statsParser[statType]( siteStats ).bind( {
					siteID
				} );
				*/
			}

			return merge( {}, state, {
				[ siteID ]: {
					[ postID || '*' ]: {
						[ statType ]: {
							[ stringifiedOptions ]: {
								response
							}
						}
					}
				}
			} );

		default:
			return state;
	}
}

export function isFetching( state = {}, action ) {
	let newState = {};
	let fetchingKey;

	switch ( action.type ) {
		case SITE_STATS_REQUEST_FAILURE:
		case SITE_STATS_RECEIVE:
			fetchingKey = getCompositeKey( action );
			newState = Object.assign( {}, state );
			delete newState[ fetchingKey ];
			break;
		case SITE_STATS_REQUEST:
			fetchingKey = getCompositeKey( action.data );
			newState = Object.assign( {}, state, {
				[ fetchingKey ]: true
			} );
			break;
		default:
			break;
	}

	return newState;
}

export default combineReducers( {
	items,
	isFetching
} );
