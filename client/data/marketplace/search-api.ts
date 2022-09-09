import wpcom from 'calypso/lib/wp';
import { RETURNABLE_FIELDS } from './constants';
import type { SearchParams } from './types';

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
 * @returns {string} The generated query string.
 */
function generateApiQueryString( {
	query,
	author,
	groupId,
	pageHandle,
	pageSize,
	locale,
}: SearchParams ) {
	const sort = 'score_default';

	const params: {
		fields: string[];
		filter?: { bool: { must: object[] } };
		page_handle?: string;
		query: string;
		sort: string;
		size: number;
		group_id: string;
		from?: number;
		lang: string;
	} = {
		fields: [ ...RETURNABLE_FIELDS ],
		page_handle: pageHandle,
		query: encodeURIComponent( query ?? '' ),
		sort: mapSortToApiValue( sort ),
		size: pageSize,
		lang: locale,
		group_id: groupId,
	};

	if ( author ) {
		params.filter = getFilterbyAuthor( author );
	}

	return params;
}

const marketplaceSearchApiBase = '/marketplace/search';
const apiVersion = '1.3';

/**
 * Perform a search.
 *
 * @param {object} options - Search options
 * @returns {Promise} A promise to the JSON response object
 */
export function search( options: SearchParams ) {
	const queryString = generateApiQueryString( options );

	return wpcom.req.get(
		{
			path: marketplaceSearchApiBase,
		},
		{ ...queryString, apiVersion }
	);
}

function getFilterbyAuthor( author: string ): {
	bool: {
		must: { term: object }[];
	};
} {
	return {
		bool: {
			must: [ { term: { 'plugin.author.raw': author } } ],
		},
	};
}
