/** @format */
/**
 * External dependencies
 */

import { assign, forEach, groupBy, includes, map, reduce, sortBy } from 'lodash';

// Helpers used by sortPagesHierarchically but not exposed externally
const sortByMenuOrder = list => sortBy( list, 'menu_order' );
const getParentId = page => page.parent && page.parent.ID;

module.exports = {
	editLinkForPage: function( page, site ) {
		if ( ! ( page && page.ID ) || ! ( site && site.ID ) ) {
			return null;
		}

		return '/page/' + site.slug + '/' + page.ID;
	},

	statsLinkForPage: function( page, site ) {
		if ( ! ( page && page.ID ) || ! ( site && site.ID ) ) {
			return null;
		}

		return '/stats/post/' + page.ID + '/' + site.slug;
	},

	// TODO: switch all usage of this function to `isFrontPage` in `state/pages/selectors`
	isFrontPage: function( page, site ) {
		if ( ! page || ! page.ID || ! site || ! site.options ) {
			return false;
		}
		return site.options.page_on_front === page.ID;
	},

	sortPagesHierarchically: function( pages ) {
		const pageIds = map( pages, 'ID' );

		const pagesByParent = reduce(
			groupBy( pages, getParentId ),
			( result, list, parentId ) => {
				if (
					! parentId ||
					parentId === 'false' ||
					! includes( pageIds, parseInt( parentId, 10 ) )
				) {
					// If we don't have the parent in our list, promote the page to "top level"
					result.false = sortByMenuOrder( ( result.false || [] ).concat( list ) );
					return result;
				}

				result[ parentId ] = sortByMenuOrder( list );
				return result;
			},
			{}
		);

		const sortedPages = [];

		const insertChildren = ( pageId, indentLevel ) => {
			const children = pagesByParent[ pageId ] || [];

			forEach( children, child => {
				sortedPages.push( assign( {}, child, { indentLevel } ) );
				insertChildren( child.ID, indentLevel + 1 );
			} );
		};

		forEach( pagesByParent.false, topLevelPage => {
			sortedPages.push( topLevelPage );
			insertChildren( topLevelPage.ID, 1 );
		} );

		return sortedPages;
	},
};
