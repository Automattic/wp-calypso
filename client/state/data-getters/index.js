/**
 * External dependencies
 */
import { omit, isArray, isUndefined, sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import { http as rawHttp } from 'calypso/state/http/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'calypso/state/data-layer/http-data';
import { filterStateToApiQuery } from 'calypso/state/activity-log/utils';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import fromActivityLogApi, {
	fromActivityApi,
} from 'calypso/state/data-layer/wpcom/sites/activity/from-api';
import fromActivityTypeApi from 'calypso/state/data-layer/wpcom/sites/activity-types/from-api';

/**
 * Fetches content from a URL with a GET request
 *
 * @example
 * waitForHttpData( () => ( {
 *     planets: requestFromUrl( 'https://swapi.co/api/planets/' ),
 * } ) ).then( ( { planets } ) => {
 *     console.log( planets.data );
 * } );
 *
 * @param {string} url location from which to GET data
 * @returns {object} HTTP data wrapped value
 */
export const requestFromUrl = ( url ) =>
	requestHttpData( `get-at-url-${ url }`, rawHttp( { method: 'GET', url } ), {
		fromApi: () => ( data ) => [ [ `get-at-url-${ url }`, data ] ],
	} );

export const requestActivityActionTypeCounts = (
	siteId,
	filter,
	{ freshness = 10 * 1000 } = {}
) => {
	const before = filter && filter.before ? filter.before : '';
	const after = filter && filter.after ? filter.after : '';
	const on = filter && filter.on ? filter.on : '';
	const id = `activity-log-${ siteId }-${ after }-${ before }-${ on }`;

	return requestHttpData(
		id,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/activity/count/group`,
				query: omit( filterStateToApiQuery( filter ), 'aggregate' ),
			},
			{}
		),
		{
			freshness,
			fromApi: () => ( data ) => {
				return [ [ id, fromActivityTypeApi( data ) ] ];
			},
		}
	);
};

export const getRequestActivityLogsId = ( siteId, filter ) => {
	const knownFilterOptions = [
		'action',
		'after',
		'aggregate',
		'before',
		'by',
		'dateRange',
		'group',
		'name',
		'notGroup',
		'number',
		'on',
		'sortOrder',
	];
	const filterCacheKey = knownFilterOptions
		.map( ( opt ) => {
			const optionValue = filter[ opt ];
			if ( isUndefined( optionValue ) ) {
				return undefined;
			}

			const cacheKeyValue = String( isArray( optionValue ) ? sortBy( optionValue ) : optionValue );

			return `${ opt }=${ cacheKeyValue }`;
		} )
		.filter( ( pair ) => pair )
		.join( '-' );

	return `activity-log-${ siteId }-${ filterCacheKey }`;
};

export const requestActivityLogs = ( siteId, filter, { freshness = 5 * 60 * 1000 } = {} ) => {
	const id = getRequestActivityLogsId( siteId, filter );
	return requestHttpData(
		id,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/activity`,
				query: filterStateToApiQuery( filter ),
			},
			{}
		),
		{
			freshness,
			fromApi: () => ( data ) => {
				return [ [ id, fromActivityLogApi( data ) ] ];
			},
		}
	);
};

export const getRequestActivityId = ( siteId, rewindId ) =>
	`activity-single-${ siteId }-${ rewindId }`;

export const requestActivity = ( siteId, rewindId, { freshness = 5 * 60 * 1000 } = {} ) => {
	const id = getRequestActivityId( siteId, rewindId );
	return requestHttpData(
		id,
		http(
			{
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: `/sites/${ siteId }/activity/${ rewindId }`,
			},
			{}
		),
		{
			freshness,
			fromApi: () => ( data ) => {
				return [ [ id, fromActivityApi( data ) ] ];
			},
		}
	);
};

const requestExternalContributorsId = ( siteId ) => `site-external-contributors-${ siteId }`;

export const requestExternalContributors = ( siteId ) =>
	requestHttpData(
		requestExternalContributorsId( siteId ),
		http( {
			method: 'GET',
			path: `/sites/${ siteId }/external-contributors`,
			apiNamespace: 'wpcom/v2',
		} ),
		{
			fromApi: () => ( data ) => [ [ requestExternalContributorsId( siteId ), data ] ],
		}
	);

export const requestExternalContributorsAddition = ( siteId, userId ) => {
	const requestId = requestExternalContributorsId( siteId );
	const id = `${ requestId }-addition-${ userId }`;
	return requestHttpData(
		id,
		http( {
			method: 'POST',
			path: `/sites/${ siteId }/external-contributors/add`,
			apiNamespace: 'wpcom/v2',
			body: { user_id: userId },
		} ),
		{
			fromApi: () => ( data ) => [ [ requestId, data ] ],
		}
	);
};

export const requestExternalContributorsRemoval = ( siteId, userId ) => {
	const requestId = requestExternalContributorsId( siteId );
	const id = `${ requestId }-removal-${ userId }`;
	return requestHttpData(
		id,
		http( {
			method: 'POST',
			path: `/sites/${ siteId }/external-contributors/remove`,
			apiNamespace: 'wpcom/v2',
			body: { user_id: userId },
		} ),
		{
			fromApi: () => ( data ) => [ [ requestId, data ] ],
		}
	);
};

export const requestGeoLocation = () =>
	requestHttpData(
		'geo',
		rawHttp( {
			method: 'GET',
			url: 'https://public-api.wordpress.com/geo/',
		} ),
		{ fromApi: () => ( { body: { country_short } } ) => [ [ 'geo', country_short ] ] }
	);

export const requestFeedDiscovery = ( feedId ) => {
	const requestId = `feed-discovery-${ feedId }`;

	return requestHttpData(
		requestId,
		http(
			{
				method: 'GET',
				path: '/read/feed',
				query: {
					url: feedId,
				},
				retryPolicy: noRetry(),
			},
			{}
		),
		{
			fromApi: () => ( response ) => [ [ requestId, response.feeds[ 0 ].feed_ID ] ],
		}
	);
};

export const requestSiteAlerts = ( siteId ) => {
	const id = `site-alerts-${ siteId }`;

	return requestHttpData(
		id,
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/alerts`,
				apiNamespace: 'wpcom/v2',
			},
			{}
		),
		{
			freshness: 5 * 60 * 1000,
			fromApi: () => ( { suggestions, threats, warnings, updates } ) => [
				[
					id,
					{
						suggestions,
						threats: threats.map( ( threat ) => ( {
							id: threat.id,
							signature: threat.signature,
							description: threat.description,
							firstDetected: Date.parse( threat.first_detected ),
							...( threat.context ? { filename: threat.filename, context: threat.context } : {} ),
							...( threat.diff ? { filename: threat.filename, diff: threat.diff } : {} ),
							...( threat.extension
								? {
										extension: {
											type: threat.extension.type,
											name: threat.extension.name,
											slug: threat.extension.slug,
											version: threat.extension.version,
										},
								  }
								: {} ),
						} ) ),
						warnings,
						updates: {
							themes: updates.themes.map( ( theme ) => ( {
								name: theme.name,
								slug: theme.slug,
								type: theme.type,
								version: theme.version,
							} ) ),
							core: updates.core.map( ( theme ) => ( {
								name: theme.name,
								slug: theme.slug,
								type: theme.type,
								version: theme.version,
							} ) ),
						},
					},
				],
			],
		}
	);
};

export function requestDpa( requestId ) {
	requestHttpData(
		requestId,
		http( {
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: '/me/request-dpa',
		} ),
		{
			freshness: -Infinity, // we want to allow the user to re-request
			fromApi: () => () => [ [ requestId, true ] ],
		}
	);
}
