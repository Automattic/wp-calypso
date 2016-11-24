/**
 * External dependencies
 */
import { every, some, includes } from 'lodash';

/**
 * Internal dependencies
 */
import PaginatedQueryManager from '../paginated';
import ThemeQueryKey from './key';
import { isPremium } from './util';
import { DEFAULT_THEME_QUERY } from './constants';

const SEARCH_TAXONOMIES = [ 'subject', 'feature', 'color', 'style', 'column', 'layout' ];

/**
 * ThemeQueryManager manages themes which can be queried
 */
export default class ThemeQueryManager extends PaginatedQueryManager {
	/**
	 * Returns true if the theme matches the given query, or false otherwise.
	 *
	 * @param  {Object}  query Query object
	 * @param  {Object}  theme Item to consider
	 * @return {Boolean}       Whether theme matches query
	 */

	matches( query, theme ) {
		const queryWithDefaults = { ...DEFAULT_THEME_QUERY, ...query };
		return every( queryWithDefaults, ( value, key ) => {
			switch ( key ) {
				case 'search':
					if ( ! value ) {
						return true;
					}

					const search = value.toLowerCase();

					const foundInTaxonomies = some( SEARCH_TAXONOMIES, ( taxonomy ) => (
						theme.taxonomies && some( theme.taxonomies[ 'theme_' + taxonomy ], ( { name } ) => (
							includes( name.toLowerCase(), search )
						) )
					) );

					return foundInTaxonomies || (
						( theme.name && includes( theme.name.toLowerCase(), search ) ) ||
						( theme.author && includes( theme.author.toLowerCase(), search ) ) ||
						( theme.descriptionLong && includes( theme.descriptionLong.toLowerCase(), search ) )
					);

				case 'filters':
					// TODO: Change filters object shape to be more like post's terms, i.e.
					// { color: 'blue,red', feature: 'post-slider' }
					const filters = value.split( ',' );
					return every( filters, ( filter ) => (
						some( theme.taxonomies, ( terms ) => (
							some( terms, { slug: filter } )
						) )
					) );

				case 'tier':
					if ( ! value ) {
						return true;
					}
					const queryingForPremium = value === 'premium';
					return queryingForPremium === isPremium( theme );
			}

			return true;
		} );
	}
}

ThemeQueryManager.QueryKey = ThemeQueryKey;

ThemeQueryManager.DEFAULT_QUERY = DEFAULT_THEME_QUERY;
