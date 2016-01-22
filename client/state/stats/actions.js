/**
 * Internal dependencies
 */
import { SITE_STATS_RECEIVE, SITE_STATS_REQUEST, SITE_STATS_REQUEST_FAILURE } from 'state/action-types';
import { isDocumentedEndpoint, isUndocumentedEndpoint, isPostIdEndpoint, getValidEndpoints } from 'lib/stats/endpoints';
import wpcom from 'lib/wp';

/**
 * Returns an action object to be used in signalling that a site stats object has
 * been received.
 *
 * @param  {Object} payload keys: siteID, statType, options, response
 * @return {Object}      Action object
 */
function receiveSiteStats( payload ) {
	const { siteID, statType, options, response } = payload;
	return {
		type: SITE_STATS_RECEIVE,
		siteID,
		statType,
		options,
		response
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

	if ( isDocumentedEndpoint( statType ) ) {
		wpcomSite = wpcom.site( siteID );
	} else if ( isUndocumentedEndpoint( statType ) ) {
		wpcomSite = wpcom.undocumented().site( siteID );
	} else {
		throw new TypeError( 'options.statType must be one of the following: ' + getValidEndpoints() );
	}

	// statsPostViews && statsVideo expect just the post.ID as a param
	if ( isPostIdEndpoint( statType ) ) {
		_options = options.post;
	}

	return ( dispatch ) => {
		dispatch( {
			type: SITE_STATS_REQUEST,
			data
		} );

		return new Promise( ( resolve ) => {
			wpcomSite[ statType ].call( wpcomSite, _options, ( error, response ) => {
				if ( error ) {
					dispatch( {
						type: SITE_STATS_REQUEST_FAILURE,
						data
					} );
				} else {
					dispatch( receiveSiteStats( {
						siteID,
						statType,
						response,
						options: _options
					} ) );
				}
				resolve();
			} );
		} );
	};
}
