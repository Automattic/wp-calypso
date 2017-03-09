/**
 * External dependencies
 */
import cloneDeep from 'lodash/cloneDeep';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import ThemeQueryKey from './key';
import { DEFAULT_THEME_QUERY } from './constants';

/**
 * ThemeQueryManager manages themes which can be queried
 */
export default class ThemeQueryManager extends PaginatedQueryManager {

	receive( items, options = {} ) {
		const oldQueries = cloneDeep( this.data.queries );
		const nextManager = super.receive( items, options );
		const queryKey = this.constructor.QueryKey.stringify( options.query );
		const nextQuery = nextManager.data.queries[ queryKey ];

		if ( ! options.query ) {
			return this.constructor(
				Object.assign( {}, {
					items: nextManager.data.items,
					queries: Object.assign( {}, oldQueries )
				} ),
				nextManager.options
			);
		}

		return this.constructor(
			Object.assign( {}, {
				items: nextManager.data.items,
				queries: Object.assign( {}, oldQueries, {
					[ queryKey ]: nextQuery
				} )
			} ),
			nextManager.options
		);
	}

	/**
	 * A sorting function that defines the sort order of items under
	 * consideration of the specified query.
	 *
	 * Note that this isn't doing anything so the results are kept in the order they
	 * are received from the endpoint.
	 * The themes query REST API endpoint uses ElasticSearch to sort results by
	 * relevancy, which we cannot easily mimick on the client side.
	 */
	sort() {
		return; // Leave the keys argument unchanged.
	}
}

ThemeQueryManager.QueryKey = ThemeQueryKey;

ThemeQueryManager.DEFAULT_QUERY = DEFAULT_THEME_QUERY;
