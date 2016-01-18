/**
 * External dependencies
 */
import { memoize } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST
} from 'state/action-types';

const postIdEndpoints = [ 'statsVideo', 'statsPostViews' ];
const documentedEndpoints = [ 'statsVideo', 'statsPublicize', 'statsStreak', 'statsFollowers', 'statsCommentFollowers', 'statsTopAuthors', 'statsTags', 'statsComments', 'statsPostViews', 'statsVideoPlays', 'stats', 'statsVisits', 'statsReferrers', 'statsTopPosts', 'statsClicks', 'statsCountryViews', 'statsSearchTerms' ];
const undocumentedEndpoints = [ 'statsEvents', 'statsInsights' ];

const isDocumentedEndpoint = ( statType ) => {
	return memoize( () => {
		return documentedEndpoints.includes( statType );
	} );
};

const isUndocumentedEndpoint = ( statType ) => {
	return memoize( () => {
		return undocumentedEndpoints.includes( statType );
	} );
};

/**
 * Returns an action object to be used in signalling that a site stats object has
 * been received.
 *
 * @param  {Object} siteStats The Site Stats received
 * @return {Object}      Action object
 */
export function receiveSiteStats( siteStats ) {
	console.log('siteStatsReceive');
	return {
		type: SITE_STATS_RECEIVE,
		siteStats
	};
}

export function fetchSiteStats( data ) {
	const {
		options,
		statType,
		siteID
	} = data;
	let wpcomSite;
	let _options = options;
console.log('fetchSiteStats', data);
	if ( isDocumentedEndpoint( statType ) ) {
		wpcomSite = wpcom.site( siteID );
	} else if ( isUndocumentedEndpoint( statType ) ) {
		wpcomSite = wpcom.undocumented().site( siteID );
	} else {
		throw new TypeError( 'options.statType must be one of the following: ' + undocumentedEndpoints.concat( documentedEndpoints ).join( ', ' ) );
	}

	// statsPostViews && statsVideo expect just the post.ID as a param
	if ( postIdEndpoints.indexOf( statType ) >= 0 ) {
		_options = options.post;
	}

// @TODO
	//this.startedAt = Date.now();

	return ( dispatch ) => {
		dispatch( {
			type: SITE_STATS_REQUEST,
			data
		} );

		return new Promise( ( resolve ) => {
			wpcomSite[ statType ].call( wpcomSite, _options, ( error, response ) => {
				if ( error ) {
					//dispatch();
					console.log( 'dispatch error handler', error, response );
				} else {
					//dispatch();
					console.log( 'dispatch receiveSiteStats', response );
				}
				resolve();
			} );
		} );
	};
}
