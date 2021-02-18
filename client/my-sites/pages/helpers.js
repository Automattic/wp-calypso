/**
 * External dependencies
 */
import { assign, forEach, groupBy, includes, map, reduce, sortBy } from 'lodash';

// Helpers used by sortPagesHierarchically but not exposed externally
const sortByMenuOrder = ( list ) => sortBy( list, 'menu_order' );
const getParentId = ( page ) => page.parent && page.parent.ID;

export const statsLinkForPage = ( { ID: pageId } = {}, { ID: siteId, slug } ) =>
	pageId && siteId ? `/stats/post/${ pageId }/${ slug }` : null;

// TODO: switch all usage of this function to `isFrontPage` in `state/pages/selectors`
export const isFrontPage = ( { ID: pageId } = {}, { options } = {} ) =>
	pageId && options && options.page_on_front === pageId;

export const sortPagesHierarchically = ( pages ) => {
	const pageIds = map( pages, 'ID' );

	const pagesByParent = reduce(
		groupBy( pages, getParentId ),
		( result, list, parentId ) => {
			if ( ! parentId || parentId === 'false' || ! includes( pageIds, parseInt( parentId, 10 ) ) ) {
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

		forEach( children, ( child ) => {
			sortedPages.push( assign( {}, child, { indentLevel } ) );
			insertChildren( child.ID, indentLevel + 1 );
		} );
	};

	forEach( pagesByParent.false, ( topLevelPage ) => {
		sortedPages.push( topLevelPage );
		insertChildren( topLevelPage.ID, 1 );
	} );

	return sortedPages;
};
