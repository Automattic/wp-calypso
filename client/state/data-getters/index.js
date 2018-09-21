/** @format */

/**
 * External dependencies
 */
import { chunk, difference, sortBy } from 'lodash';
/**
 * Internal dependencies
 */
import { http as rawHttp } from 'state/http/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { filterStateToApiQuery } from 'state/activity-log/utils';
import fromActivityLogApi from 'state/data-layer/wpcom/sites/activity/from-api';
import fromActivityTypeApi from 'state/data-layer/wpcom/sites/activity-types/from-api';

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
				query: filterStateToApiQuery( filter ),
			},
			{}
		),
		{
			freshness,
			fromApi: () => data => {
				return [ [ id, fromActivityTypeApi( data ) ] ];
			},
		}
	);
};

export const requestActivityLogs = ( siteId, filter, { freshness = 5 * 60 * 1000 } = {} ) => {
	const group =
		filter && filter.group && filter.group.length ? sortBy( filter.group ).join( ',' ) : '';
	const before = filter && filter.before ? filter.before : '';
	const after = filter && filter.after ? filter.after : '';
	const on = filter && filter.on ? filter.on : '';

	const id = `activity-log-${ siteId }-${ group }-${ after }-${ before }-${ on }`;
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
			fromApi: () => data => {
				return [ [ id, fromActivityLogApi( data ) ] ];
			},
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

export const requestRecentPostViews = ( siteId, postIds ) => {
	const key = `recent-post-views-${ siteId }`;
	const freshness = 5 * 60 * 1000; // 5 min

	// Don't re-request recent post views that are cached and up to date OR
	// have a pending request.
	const freshPostIds = postIds.filter(
		postId =>
			getHttpData( `${ key }-${ postId }` ).lastUpdated >= Date.now() - freshness &&
			getHttpData( `${ key }-${ postId }` ).status !== 'pending'
	);
	const requestPostIds = difference( postIds, freshPostIds );

	// Break post_ids into chunks of 100 because `stats/views/posts`
	// is limited to 100 post_ids per query.
	return chunk( requestPostIds, 100 ).map( postIdsChunk => {
		const postIdsList = postIdsChunk.join( ',' );

		return requestHttpData(
			`${ key }-${ postIdsList }`,
			http(
				{
					method: 'GET',
					path: `/sites/${ siteId }/stats/views/posts`,
					apiVersion: '1.1',
					query: {
						post_ids: postIdsList,
						num: 30,
					},
				},
				{}
			),
			{
				fromApi: () => ( { posts } ) =>
					posts.map( post => [ `${ key }-${ post.ID }`, post.views ] ),
				freshness,
			}
		);
	} );
};

export const requestSiteAlerts = siteId => {
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
						threats: threats.map( threat => ( {
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
							themes: updates.themes.map( theme => ( {
								name: theme.name,
								slug: theme.slug,
								type: theme.type,
								version: theme.version,
							} ) ),
							core: updates.core.map( theme => ( {
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

export const requestGutenbergDraftPost = ( siteId, draftId ) =>
	requestHttpData(
		draftId,
		http(
			{
				path: `/sites/${ siteId }/posts/auto-draft`,
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				body: {}, //this is for a POST verb.
			},
			{}
		),
		{ fromApi: () => data => [ [ draftId, data ] ] }
	);

export const requestSitePost = ( siteId, postId ) =>
	requestHttpData(
		`gutenberg-site-${ siteId }-post-${ postId }`,
		http(
			{
				path: `/sites/${ siteId }/posts/${ postId }?context=edit`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			},
			{}
		),
		{ fromApi: () => post => [ [ `gutenberg-site-${ siteId }-post-${ postId }`, post ] ] }
	);
