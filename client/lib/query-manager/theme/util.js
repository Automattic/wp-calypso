/**
 * External dependencies
 */
import { get, startsWith, every, some, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { DEFAULT_THEME_QUERY } from './constants';

const SEARCH_TAXONOMIES = [ 'subject', 'feature', 'color', 'style', 'column', 'layout' ];
/**
 * Whether a given theme object is premium.
 *
 * @param  {Object} theme Theme object
 * @return {Boolean}      True if the theme is premium
 */
export function isPremium( theme ) {
	const themeStylesheet = get( theme, 'stylesheet', false );
	return themeStylesheet && startsWith( themeStylesheet, 'premium/' );
}

/**
 * Returns true if the theme matches the given query, or false otherwise.
 *
 * @param  {Object}  query Query object
 * @param  {Object}  theme Item to consider
 * @return {Boolean}       Whether theme matches query
 */

export function matchThemeByQuery( query, theme ) {
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
