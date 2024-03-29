import { forEach, groupBy, includes, map, reduce, sortBy } from 'lodash';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

// Helpers used by sortPagesHierarchically but not exposed externally
const sortByMenuOrder = ( list ) => sortBy( list, 'menu_order' );
const getParentId = ( page ) => page.parent && page.parent.ID;

export const statsLinkForPage = ( { ID: pageId } = {}, { ID: siteId, slug } ) =>
	pageId && siteId ? `/stats/post/${ pageId }/${ slug }` : null;

// TODO: switch all usage of this function to `isFrontPage` in `state/pages/selectors`
export const isFrontPage = ( { ID: pageId } = {}, { options } = {} ) =>
	pageId && options && options.page_on_front === pageId;

export const sortPagesHierarchically = ( pages, homepageId = 0 ) => {
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
			sortedPages.push( { ...child, indentLevel } );
			insertChildren( child.ID, indentLevel + 1 );
		} );
	};

	forEach( pagesByParent.false, ( topLevelPage ) => {
		sortedPages.push( topLevelPage );
		insertChildren( topLevelPage.ID, 1 );
	} );

	// Places the Homepage at the top of the list.
	const homepage = sortedPages.findIndex( ( page ) => page.ID === homepageId );
	if ( homepage !== -1 ) {
		sortedPages.unshift( sortedPages.splice( homepage, 1 )[ 0 ] );
	}

	return sortedPages;
};

export const recordEvent = ( action ) => recordGoogleEvent( 'Pages', action );
