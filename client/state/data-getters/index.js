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
import { requestHttpData, httpData, empty } from 'state/data-layer/http-data';
import { filterStateToApiQuery } from 'state/activity-log/utils';
import fromActivityLogApi from 'state/data-layer/wpcom/sites/activity/from-api';
import fromActivityTypeApi from 'state/data-layer/wpcom/sites/activity-types/from-api';
import { isValidPostalCode } from 'lib/postal-code';
import {
	bumpStat,
	composeAnalytics,
	withAnalytics,
	recordTracksEvent,
} from 'state/analytics/actions';
import { convertToSnakeCase } from 'state/data-layer/utils';
import { dummyTaxRate } from 'lib/tax'; // #tax-on-checkout-placeholder
import { isEnabled } from 'config';
import { addQueryArgs } from 'lib/route';

/**
 * Fetches content from a URL with a GET request
 *
 * @example
 * waitForData( {
 *     planets: requestFromUrl( 'https://swapi.co/api/planets/' ),
 * } ).then( ( { planets } ) => {
 *     console.log( planets.data );
 * } );
 *
 * @param {string} url location from which to GET data
 * @return {object} HTTP data wrapped value
 */
export const requestFromUrl = url =>
	requestHttpData( `get-at-url-${ url }`, rawHttp( { method: 'GET', url } ), {
		fromApi: () => data => [ [ `get-at-url-${ url }`, data ] ],
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

export const requestSitePost = ( siteId, postId, postType, freshness ) => {
	//post and page types are plural except for custom post types
	//eg /sites/<siteId>/posts/1234 vs /sites/<siteId>/jetpack-testimonial/4
	const path =
		postType === 'page' || postType === 'post'
			? `/sites/${ siteId }/${ postType }s/${ postId }?context=edit`
			: `/sites/${ siteId }/${ postType }/${ postId }?context=edit`;
	if ( freshness === 0 ) {
		//clear cache. TODO: add a helper for this, or fix this case
		httpData.set( `gutenberg-site-${ siteId }-post-${ postId }`, empty );
	}
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
		{
			freshness,
			fromApi: () => post => [ [ `gutenberg-site-${ siteId }-post-${ postId }`, post ] ],
		}
	);
};

export const requestTaxRate = ( countryCode, postalCode, httpOptions ) => {
	const defaultOptions = {
		freshness: 2 * 24 * 60 * 60 * 1000, // 2 days
	};

	const optionsWithDefaults = { ...defaultOptions, ...httpOptions };

	if ( countryCode !== 'US' ) {
		return { status: 'invalid', error: 'unsupported country code' };
	}

	if ( ! isValidPostalCode( postalCode, countryCode ) ) {
		return { status: 'invalid', error: 'invalid postal code' };
	}

	const id = `tax-rate-${ countryCode }-${ postalCode }`;
	const path = `/tax-rate/${ countryCode }/${ postalCode }` && '/sites/example.wordpress.com/hello'; // #tax-on-checkout-placeholder

	const fetchAction = withAnalytics(
		composeAnalytics(
			bumpStat( 'calypso_tax_rate_request', 'request' ),
			bumpStat( 'calypso_tax_rate_request_country_code', countryCode ),
			bumpStat( 'calypso_tax_rate_request_postal_code', postalCode ),
			recordTracksEvent(
				'calypso_tax_rate_request',
				convertToSnakeCase( {
					countryCode,
					postalCode,
				} )
			)
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
		// #tax-on-checkout-placeholder
		// eslint-disable-next-line no-unused-vars
		fromApi: () => tax_data => {
			return [ [ id, dummyTaxRate( postalCode, countryCode ) ] ];
		},
		...optionsWithDefaults,
	} );
};

export const requestGutenbergBlockAvailability = siteSlug => {
	const betaQueryArgument = addQueryArgs( { beta: isEnabled( 'jetpack/blocks/beta' ) }, '' );
	return requestHttpData(
		`gutenberg-block-availability-${ siteSlug }`,
		http(
			{
				path: `/sites/${ siteSlug }/gutenberg/available-extensions${ betaQueryArgument }`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
			},
			{}
		),
		{ fromApi: () => data => [ [ `gutenberg-block-availability-${ siteSlug }`, data ] ] }
	);
};

export const requestActiveThemeSupport = siteSlug =>
	requestHttpData(
		`active-theme-support-${ siteSlug }`,
		http(
			{
				path: `/sites/${ siteSlug }/theme-support`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
			},
			{}
		),
		{ fromApi: () => data => [ [ `active-theme-support-${ siteSlug }`, data ] ] }
	);
