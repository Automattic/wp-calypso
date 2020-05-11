/**
 * External dependencies
 */
import { isEqual, omit } from 'lodash';

const CLEAN_QUERY_REMOVE_PROPERTIES = [ 'page_handle', 'number' ];

// TypeScript utility types aren't picked up by the JSDOC rules
// so eslint doesn't know that `Omit` exists globally
/* eslint-disable jsdoc/no-undefined-types */
/**
 * Cleans a query object of "state" properties like the current page or number
 * of items
 *
 * @template T
 * @param {T} query Query object to clean
 * @returns {Omit<T, 'page_handle' | 'number'>} The cleaned query
 */
export const cleanQuery = ( query ) => omit( query, CLEAN_QUERY_REMOVE_PROPERTIES );
/* eslint-enable jsdoc/no-undefined-types */

/**
 * Compares two queries to see if they are matching, ignoring
 * properties immaterial to the fact.
 *
 * @param {object} left A query to compare
 * @param {object} right Another query to compare
 * @returns {boolean} true if the queries match, false otherwise
 */
export const areQueriesMatching = ( left, right ) => {
	return isEqual( cleanQuery( left ), cleanQuery( right ) );
};

/**
 * Checks whether a media item matches a given query
 *
 * @param {object} item A media item to check
 * @param {string?} item.title The item's title
 * @param {string} item.external ...
 * @param {string?} item.mime_type The itme's mime type
 * @param {object} query The query against which to check `item`
 * @param {object?} query.source The query's source
 * @param {string?} query.search The search string
 * @returns {boolean} true if `item` matches `query`; false otherwise
 */
export const isItemMatchingQuery = ( item, query ) => {
	const cleanedQuery = cleanQuery( query );

	if ( ! Object.keys( cleanedQuery ).length ) {
		// default/empty query
		return true;
	}

	const { search, source } = cleanedQuery;
	const hasSource = !! source;

	let matches;

	if ( search && ! hasSource ) {
		// WP_Query tests a post's title and content when performing a search.
		// Since we're testing binary data, we match the title only.
		//
		// See: https://core.trac.wordpress.org/browser/tags/4.2.2/src/wp-includes/query.php#L2091
		matches = item.title?.toLowerCase().includes( search.toLowerCase() );
	}

	if ( hasSource && matches ) {
		// On uploading external images, the stores will receive the MEDIA_ITEM_CREATE event
		// and will update the list of media including the new one, but we don't want this new media
		// to be shown in the external source's list - hence the filtering.
		//
		// One use case where this happened was:
		//
		// - go to site icon settings and open google modal
		// - select and image and tap continue
		// - cancel the editing process and you'll be send back to the google modal
		//
		// without this change, the new upload would be shown there.

		matches = ! item.external;
	}

	if ( cleanedQuery.mime_type && matches ) {
		// Mime type query can contain a fragment, e.g. "image/", so match
		// item mime type at beginning
		matches = item.mime_type?.startsWith( cleanedQuery.mime_type );
	}

	return !! matches;
};

const DEFAULT_ACTIVE_QUERY = Object.freeze( { isFetchingNextPage: false, number: 20 } );
/**
 * Plucks the active query and list of media ids from the listStore state
 * returning useful defaults when the site doesn't have one yet.
 *
 * @param {object} state Current state
 * @param {number} siteId Site ID to get the state for
 */
export const pluckActiveQueryAndMedia = ( state, siteId ) => ( {
	activeQuery: state.activeQueries[ siteId ] ?? { ...DEFAULT_ACTIVE_QUERY },
	media: state.media[ siteId ] ?? [],
} );

/**
 * Transforms the listStore state for a given site while ensuring
 * that active query and media have safe defaults
 *
 * Do not use this function if you're trying to intentionally exclude
 * a site's media or active query
 *
 * @param {object} previousState The previous listStore state
 * @param {number} siteId The site being transformed
 * @param {object} nextState The state to transform into
 * @param {object?} nextState.activeQuery The new active query for the site
 * @param {number[]?} nextState.media The new media for the site
 *
 * @returns {object} The next listStore state
 */
export const getSafeNextListStoreState = (
	previousState,
	siteId,
	{ activeQuery: nextActiveQuery, media: nextMedia }
) => {
	const { activeQuery: previousActiveQuery, media: previousMedia } = pluckActiveQueryAndMedia(
		previousState,
		siteId
	);

	return {
		...previousState,
		activeQueries: {
			...previousState.activeQueries,
			[ siteId ]: nextActiveQuery ?? previousActiveQuery,
		},
		media: {
			...previousState.media,
			[ siteId ]: nextMedia ?? previousMedia,
		},
	};
};
