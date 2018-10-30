/** @format */

/**
 * External dependencies
 */
import { omit, sortBy } from 'lodash';
/**
 * Internal dependencies
 */
import { http as rawHttp } from 'state/http/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestHttpData } from 'state/data-layer/http-data';
import { filterStateToApiQuery } from 'state/activity-log/utils';
import fromActivityLogApi from 'state/data-layer/wpcom/sites/activity/from-api';
import fromActivityTypeApi from 'state/data-layer/wpcom/sites/activity-types/from-api';
import { isValidPostalCode } from 'lib/postal-code';
import { withAnalytics, recordTracksEvent } from 'state/analytics/actions';
import { convertToSnakeCase } from 'state/data-layer/utils';
import { dummyTaxRate } from 'lib/tax'; // #tax-on-checout-placeholder

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
	const aggregate = filter && filter.aggregate ? filter.aggregate : '';

	const id = `activity-log-${ siteId }-${ group }-${ after }-${ before }-${ on }-${ aggregate }`;
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

export const createAutoDraft = ( siteId, draftKey, postType ) =>
	requestHttpData(
		draftKey,
		http(
			{
				path: `/sites/${ siteId }/posts/new`,
				method: 'POST',
				apiVersion: '1.2',
				body: {
					status: 'auto-draft',
					type: postType,
					content: ' ', //endpoint only creates this with non-empty content ¯\_(ツ)_/¯
				},
			},
			{}
		),
		{ fromApi: () => data => [ [ draftKey, data ] ] }
	);

export const requestGutenbergDemoContent = () =>
	requestHttpData(
		'gutenberg-demo-content',
		http(
			{
				path: `/gutenberg/demo-content`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
			},
			{}
		),
		{ fromApi: () => data => [ [ 'gutenberg-demo-content', data ] ] }
	);

export const requestSitePost = ( siteId, postId, postType ) => {
	//post and page types are plural except for custom post types
	//eg /sites/<siteId>/posts/1234 vs /sites/<siteId>/jetpack-testimonial/4
	const path =
		postType === 'page' || postType === 'post'
			? `/sites/${ siteId }/${ postType }s/${ postId }?context=edit`
			: `/sites/${ siteId }/${ postType }/${ postId }?context=edit`;
	return requestHttpData(
		`gutenberg-site-${ siteId }-post-${ postId }`,
		http(
			{
				path,
				method: 'GET',
				apiNamespace: 'wp/v2',
			},
			{}
		),
		{ fromApi: () => post => [ [ `gutenberg-site-${ siteId }-post-${ postId }`, post ] ] }
	);
};

// data-getter:
export const requestTaxRate = ( countryCode, postalCode, httpOptions ) => {
	const defaultOptions = {
		freshness: /*24 * */ 60 * 1000,
	};

	const optionsWithDefaults = { ...defaultOptions, ...httpOptions };

	if ( countryCode !== 'US' ) {
		return { status: 'invalid', error: 'unsupported country code' };
	}

	if ( ! isValidPostalCode( postalCode, countryCode ) ) {
		return { status: 'invalid', error: 'invalid postal code' };
	}

	const id = `tax-rate-${ countryCode }-${ postalCode }`;
	const path = `/tax-rate/${ countryCode }/${ postalCode }` && '/sites/example.wordpress.com/hello'; // #tax-on-checout-placeholder

	const fetchAction = withAnalytics(
		recordTracksEvent(
			'calypso_tax_rate_request',
			convertToSnakeCase( {
				countryCode,
				postalCode,
			} )
		),
		http(
			{
				path,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
			},
			{}
		)
	);

	return requestHttpData( id, fetchAction, {
		// #tax-on-checout-placeholder
		// eslint-disable-next-line no-unused-vars
		fromApi: () => tax_data => {
			return [ [ id, dummyTaxRate( postalCode, countryCode ) ] ];
		},
		...optionsWithDefaults,
	} );
};
