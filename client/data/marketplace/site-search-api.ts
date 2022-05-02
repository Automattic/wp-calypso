import { flatten } from 'q-flat';
import { encode } from 'qss';
import { ESDateRangeFilter, ESTermFilter } from './types';

const isLengthyArray = ( array: Array< unknown > ) => Array.isArray( array ) && array.length > 0;

const filterKeyToEsFilter: Record< string, ( param: string ) => ESTermFilter | ESDateRangeFilter > =
	{
		post_types: ( postType ) => ( { term: { post_type: postType } } ),
		category: ( category ) => ( { term: { 'category.slug': category } } ),
		post_tag: ( tag ) => ( { term: { 'tag.slug': tag } } ),
	};

export const FILTER_KEYS = Object.freeze( [
	'author',
	'post_types',
	'category',
	'post_format',
	'post_tag',
] );

/**
 * Build an ElasticSerach filter object.
 *
 * @param {object} filterQuery - Filter query value object.
 * @returns {object} ElasticSearch filter object.
 */
function buildFilterObject( filterQuery: Record< string, string[] > ) {
	const filter: { bool: { must: object[] } } = { bool: { must: [] } };
	FILTER_KEYS.filter( ( key ) => {
		return isLengthyArray( filterQuery[ key ] );
	} ).forEach( ( key ) => {
		filterQuery[ key ].forEach( ( item ) => {
			if ( filterKeyToEsFilter[ key ] ) {
				filter.bool.must.push( filterKeyToEsFilter[ key ]( item ) );
			} else {
				// If key is not in the standard map, assume to be a custom taxonomy
				filter.bool.must.push( { term: { [ `taxonomy.${ key }.slug` ]: item } } );
			}
		} );
	} );
	return filter;
}

// Maps sort values to values expected by the API
const SORT_QUERY_MAP = new Map( [
	[ 'oldest', 'date_asc' ],
	[ 'newest', 'date_desc' ],
	[ 'relevance', 'score_default' ],
] );
/**
 * Map sort values to ones compatible with the API.
 *
 * @param {string} sort - Sort value.
 * @returns {string} Mapped sort value.
 */
function mapSortToApiValue( sort: string ) {
	// Some sorts don't need to be mapped
	if ( [ 'price_asc', 'price_desc', 'rating_desc' ].includes( sort ) ) {
		return sort;
	}

	return SORT_QUERY_MAP.get( sort ) ?? 'score_default';
}

/**
 * Generate the query string for an API request
 *
 * @param {object} options - Options object for the function
 * @returns {string} The generated query string.
 */
function generateApiQueryString( {
	author,
	filter,
	groupId,
	query,
	sort,
	postsPerPage = 10,
}: {
	author?: string;
	filter: Record< string, string[] >;
	groupId: string;
	query: string;
	sort: string;
	postsPerPage?: number;
} ) {
	if ( query === null ) {
		query = '';
	}

	const WPORGFIELDS = [
		'rating',
		'post_id',
		'meta.assets_icons.value',
		'meta.header_author.value',
		'meta.header_author_uri.value',
		'meta.last_updated.value',
		'taxonomy.plugin_category.name',
		'taxonomy.plugin_tags.name',
		'excerpt_en',
		'title_en',
		'stable_tag',
		'author',
		'tested',
		'num_ratings',
		'support_threads',
		'support_threads_resolved',
		'active_installs',
		'last_updated',
		'slug',
	];

	const fields = [
		'date',
		'permalink.url.raw',
		'tag.name.default',
		'category.name.default',
		'post_type',
		'has.image',
		'shortcode_types',
		'image.url.raw',
	];

	let params: {
		fields: string[];
		filter: { bool: { must: object[] } };
		query: string;
		sort: string;
		size: number;
		group_id?: string;
	} = {
		fields: [ ...fields, ...WPORGFIELDS ],
		filter: buildFilterObject( filter ),
		query: encodeURIComponent( query ),
		sort: mapSortToApiValue( sort ),
		size: postsPerPage,
	};

	if ( groupId ) {
		params = {
			...params,
			group_id: groupId,
		};
	}

	if ( author ) {
		// TODO implement author search
	}

	return encode( flatten( params ) );
}

/**
 * Perform a search.
 *
 * @param {object} options - Search options
 * @param {number} requestId - Sequential ID used to determine recency of requests.
 * @returns {Promise} A promise to the JSON response object
 */
export function search( options ) {
	const queryString = generateApiQueryString( options );

	const pathForPublicApi = `/sites/${ options.siteId }/search?${ queryString }`;

	const url = `https://public-api.wordpress.com/rest/v1.3${ pathForPublicApi }`;

	// NOTE: API Nonce is necessary to authenticate requests to class-wpcom-rest-api-v2-endpoint-search.php.
	return fetch( url, {
		headers: {},
		credentials: 'same-origin',
	} )
		.then( ( response ) => {
			if ( response.status !== 200 ) {
				return Promise.reject(
					`Unexpected response from API with status code ${ response.status }.`
				);
			}
			return response;
		} )
		.then( ( r ) => r.json() );
}
