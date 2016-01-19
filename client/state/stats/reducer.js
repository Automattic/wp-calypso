/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { SITE_STATS_RECEIVE } from 'state/action-types';
import { isPostIdEndpoint } from 'lib/stats/endpoints';
import statsParserFactory from 'lib/stats/stats-list/stats-parser';
const statsParser = statsParserFactory();

export function sites( state = {}, action ) {
	switch ( action.type ) {
		case SITE_STATS_RECEIVE:
			const { siteID, statType, response } = action;
			// siteID `0` means "all sites"
			const _siteID = parseInt( siteID, 10 ) || 0;
			let siteStats = Object.assign( {}, response );

			// @TODO Apply statsParser transformations
			if ( typeof statsParser[statType] === 'function' ) {
				/*
				console.log( 'calling parser fn ' + statType );
				siteStats = statsParser[statType]( siteStats ).bind( {
					siteID
				} );
				*/
			}

			let _sites = state.sites || {};
			_sites[_siteID] = _sites[_siteID] || {};
			let site = _sites[_siteID];

			const postID = _siteID && siteStats.post && siteStats.post.ID
				? parseInt( siteStats.post.ID, 10 )
				: 0;

			if ( postID ) {
				// Store post stats under posts[post_id]
				site.posts = site.posts || {};
				site.posts[postID] = site.posts[postID] || {};

				let postStats = site.posts[postID];

				// Then by statType / endpoint
				postStats[statType] = Object.assign( {}, postStats[statType] || {}, siteStats );
			} else {
				// Everything else is just by statType / endpoint
				site[statType] = Object.assign( {}, site[statType] || {}, siteStats );
			}

			state.sites = Object.assign( {}, _sites );
			console.log('NEWNEWSSSSSS', state);
			break;
	}
	return state;
}

export default combineReducers( {
	sites
} );
