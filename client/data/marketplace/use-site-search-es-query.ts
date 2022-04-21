import phpUnserialize from 'phpunserialize';
import { UseQueryResult, UseQueryOptions, InfiniteData, useInfiniteQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { extractSearchInformation, normalizePluginsList } from 'calypso/lib/plugins/utils';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_SIZE, DEFAULT_CATEGORY } from './constants';
import { ESHits, Plugin, QueryOptions } from './types';

/**
 * Constants
 */
const SITE_SEARCH_ENDPOINT = 'https://public-api.wordpress.com/rest/v1/sites/108986944/search';

/**
 *
 * @param pluginSlug
 * @param iconsArray
 * @returns An object containing a resolution -> icon url map
 */
const createIconsObject = ( pluginSlug: string, iconsArray: string ) => {
	type Icon = {
		resolution: string;
		filename: string;
		location: string;
		revision: string;
	};
	const icons: Record< string, Icon > = phpUnserialize( iconsArray );
	return Object.values( icons ).reduce(
		( prev: Record< string, string >, { resolution, filename, location, revision } ) => {
			prev[
				resolution
			] = `https://ps.w.org/${ pluginSlug }/${ location }/${ filename }?rev=${ revision }`;
			return prev;
		},
		{}
	);
};

const createAuthorUrl = ( header_author: string, header_author_uri: string ) =>
	`<a href="${ header_author_uri }">${ header_author }</a>`;

const mapIndexResultsToPluginData = ( results: ESHits ): Plugin[] => {
	return results.map( ( { fields: hit } ) => {
		return {
			name: hit.title_en, // TODO: add localization
			slug: hit.slug,
			version: hit.stable_tag,
			author: createAuthorUrl(
				hit[ 'meta.header_author.value' ],
				hit[ 'meta.header_author_uri.value' ]
			),
			author_profile: hit[ 'meta.header_author_uri.value' ], // TODO: get author profile URL
			tested: hit.tested,
			rating: hit.rating,
			num_ratings: hit.num_ratings,
			support_threads: hit.support_threads,
			support_threads_resolved: hit.support_threads_resolved,
			active_installs: hit.active_installs,
			last_updated: hit[ 'meta.last_updated.value' ],
			short_description: hit.excerpt_en, // TODO: add localization
			icons: createIconsObject( hit.slug, hit[ 'meta.assets_icons.value' ] ),
		};
	} );
};

/**
 *
 * @param url The url to post to
 * @param body The body of the request
 * @returns {Promise<Response>} A promise that resolves to the response body
 */
async function postRequest( url: string, body: object ) {
	const response = await fetch( `${ url }`, {
		method: 'POST',
		body: JSON.stringify( body ),
		headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
	} );

	if ( response.ok ) {
		return await response.json();
	}
	throw new Error( await response.text() );
}

export async function fetchWPOrgPluginsFromSiteSearch( options: QueryOptions ) {
	const category = options.category || DEFAULT_CATEGORY;
	const search = options.searchTerm;
	const author = options.author;

	// Set up base query
	const size = options.pageSize || DEFAULT_PAGE_SIZE;
	const from = ( ( options.page || DEFAULT_FIRST_PAGE ) - 1 ) * size;
	const must: object[] = [];
	const should: object[] = [];
	const query = {
		bool: {
			must,
			should,
		},
	};

	// add a match clause to the query
	const addMatch = ( term: object[], match: object ) => {
		term.push( { match } );
	};

	if ( search ) {
		must.push( {
			multi_match: {
				fields: [
					'title.en^0.1',
					'content.en^0.1',
					'excerpt.en^0.1',
					'tag.name.en^0.1',
					'category.name.en^0.1',
					'author_login^0.1',
					'author^0.1',
					'slug^0.1',
				],
				query: search,
				operator: 'and',
			},
		} );
	}

	if ( author ) {
		addMatch( must, { author } );
	}

	// matching category if no other criteria given
	if ( ! search && ! author ) {
		addMatch( must, { 'taxonomy.plugin_category.name': category } );
	}

	const fields = [
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

	const requestResult = await postRequest( SITE_SEARCH_ENDPOINT, {
		query,
		fields,
		size,
		from,
	} );

	return requestResult.results;
}

const extractPagesFromEsResponse = ( total: number, pageSize: number, page: number ) => {
	return {
		page: page || DEFAULT_FIRST_PAGE,
		pages: Math.ceil( total / pageSize ),
		results: total,
	};
};

type ESResponse = {
	hits: ESHits;
	total: number;
};

/**
 * Returns a list of plugins from WPORG site search
 *
 * @param options Optional options to pass to the underlying query
 * @returns {{ data, error, isLoading: boolean ...}} Returns various parameters piped from `useQuery`
 */
export const useSiteSearchWPORGPlugins = (
	options: QueryOptions,
	{ enabled = true, staleTime = 0 /* TODO remove */, refetchOnMount = true }: UseQueryOptions = {}
): UseQueryResult => {
	const [ searchTerm, author ] = extractSearchInformation( options.searchTerm );
	const locale = useSelector( getCurrentUserLocale );
	const pageSize: number = options.pageSize ?? DEFAULT_PAGE_SIZE;
	const page: number = options.page ?? DEFAULT_FIRST_PAGE;

	return useInfiniteQuery(
		'wpcom-site-search-wporg-plugins',
		( { pageParam = DEFAULT_FIRST_PAGE } ) =>
			fetchWPOrgPluginsFromSiteSearch( {
				pageSize,
				page: pageParam,
				category: options.category,
				locale: options.locale || locale,
				searchTerm,
				author,
			} ),
		{
			//select: ( data ) => normalizePluginsList( data ),
			select: ( data: InfiniteData< ESResponse > ) => ( {
				pages: data.pages,
				pageParams: data.pageParams,
				plugins: normalizePluginsList( mapIndexResultsToPluginData( data.hits ) ), // TODO flatmap from pages?
				pagination: extractPagesFromEsResponse( data.total, pageSize, page ),
			} ),
			enabled,
			staleTime,
			refetchOnMount,
		}
	);
};
