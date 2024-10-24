import wpcom from 'calypso/lib/wp';
import { getCategories } from 'calypso/my-sites/plugins/categories/use-categories';
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
 * @param {string} sort - Sort value.
 * @returns {string} Mapped sort value.
 */
function mapSortToApiValue( sort: string ) {
	// Some sorts don't need to be mapped
	if (
		[ 'price_asc', 'price_desc', 'rating_desc', 'active_installs', 'plugin_modified' ].includes(
			sort
		)
	) {
		return sort;
	}

	return SORT_QUERY_MAP.get( sort ) ?? 'score_default';
}

/**
 * Generate the query string for an API request
 * @returns {string} The generated query string.
 */
function generateApiQueryString( {
	query,
	author,
	groupId,
	category,
	pageHandle,
	pageSize,
	locale,
	slugs,
}: SearchParams ) {
	const sort = 'score_default';

	const params: {
		fields: string[];
		filter?: { bool: object };
		page_handle?: string;
		query: string;
		sort: string;
		size: number;
		group_id: string;
		category?: string;
		from?: number;
		lang: string;
		track_total_hits: boolean;
	} = {
		fields: [ ...RETURNABLE_FIELDS ],
		page_handle: pageHandle,
		query: encodeURIComponent( query ?? '' ),
		sort: mapSortToApiValue( sort ),
		size: pageSize,
		lang: locale,
		group_id: groupId,
		track_total_hits: false,
	};

	if ( author ) {
		params.filter = getFilterbyAuthor( author );
	}
	if ( category ) {
		switch ( category ) {
			case 'featured':
				params.filter = getFilterFeaturedPlugins();
				break;
			case 'popular':
				params.sort = 'active_installs';
				params.track_total_hits = true;
				break;
			case 'new':
				params.sort = 'date_desc';
				break;
			case 'updated':
				params.sort = 'plugin_modified';
				break;
			default:
				if ( Array.isArray( slugs ) && slugs.length ) {
					params.filter = getFilterbySlugs( slugs || [] );
				} else {
					params.filter = getFilterByCategory( category );
				}
				params.sort = 'active_installs';
		}
	}

	return params;
}

const marketplaceSearchApiBase = '/marketplace/search';
const apiVersion = '1.3';

/**
 * Perform a search.
 * @param {Object} options - Search options
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

export function searchBySlug(
	slug: string,
	locale: string,
	options?: { fields?: Array< string > | undefined; group_id?: string }
) {
	const params = {
		lang: locale,
		filter: getFilterbySlug( slug ),
		fields: options?.fields ?? RETURNABLE_FIELDS,
		group_id: options?.group_id ?? 'wporg',
	};
	const queryString = params;

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

function getFilterbySlug( slug: string ): {
	bool: {
		must: { term: object }[];
	};
} {
	return {
		bool: {
			must: [ { term: { slug } } ],
		},
	};
}

function getFilterbySlugs( slugs: string[] ): {
	bool: {
		should: { terms: object }[];
	};
} {
	return {
		bool: {
			should: [ { terms: { slug: slugs } } ],
		},
	};
}

function getFilterByCategory( category: string ): {
	bool: object;
} {
	const categoryTags = getCategories()[ category ]?.tags;

	return {
		bool: {
			should: [
				// matching wp.org categories and tags
				{ term: { 'taxonomy.plugin_category.slug': category } },
				{ terms: { 'taxonomy.plugin_tags.slug': categoryTags || [ category ] } },
				// matching wc.com categories and tags
				{ term: { 'taxonomy.wpcom_marketplace_categories.slug': category } },
				{ terms: { 'taxonomy.plugin_tag.slug': categoryTags || [ category ] } },
			],
		},
	};
}

function getFilterFeaturedPlugins(): {
	bool: {
		must: { term: object }[];
	};
} {
	return {
		bool: {
			must: [ { term: { 'taxonomy.plugin_section.slug': 'featured' } } ],
		},
	};
}
