/**
 * Internal dependencies
 */
import { SITE_STATS_RECEIVE, SITE_STATS_REQUEST, SITE_STATS_REQUEST_FAILURE } from 'state/action-types';
import { isDocumentedEndpoint, isUndocumentedEndpoint, isPostIdEndpoint, getValidEndpoints } from 'lib/stats/endpoints';
import { getStatsTypesByModule } from './utils';
import wpcom from 'lib/wp';

/**
 * Returns an action object to be used in signalling that a site stats object has
 * been received.
 *
 * @param  {Object} payload data dispatched from the API response callback
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

export function createFetchActionsForModule( module, activeFilter, endDate = null, extraOptions = {} ) {
	const standardOptions = {
		period: activeFilter.period,
		date: endDate,
		max: 0
	};
	const options = Object.assign( {}, standardOptions, extraOptions );
	const actions = [];
	const statTypes = getStatsTypesByModule( module );

	statTypes.forEach( ( statType ) => {
		actions.push( { statType, options } );
	} );

	return actions;
}

export function fetchSiteStats( data ) {
	const { domain, options, siteID, statType } = data;
	const siteIdOrDomain = siteID || domain;

	if ( ! siteIdOrDomain ) {
		// Never try to fetch stats for a site without a site or domain
		console.log('no siteIdOrDomain -- bailing')
		return;
	}

	let wpcomSite;

	if ( isDocumentedEndpoint( statType ) ) {
		wpcomSite = wpcom.site( siteIdOrDomain );
	} else if ( isUndocumentedEndpoint( statType ) ) {
		wpcomSite = wpcom.undocumented().site( siteIdOrDomain );
	} else {
		throw new TypeError( 'options.statType must be one of the following: ' + getValidEndpoints() );
	}

	// statsPostViews && statsVideo expect just the post.ID as a param
	let _options = options;
	if ( isPostIdEndpoint( statType ) && _options && _options.post ) {
		_options = _options.post;
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
