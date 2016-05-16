/**
 * External dependencies
 */
import Immutable from 'immutable';

/***
 * Creates a comment target id, a concatenation of siteId and postId basically
 * @param {Number} siteId site identification
 * @param {Number} postId post identification
 * @returns {String} comment target id
 */
export function getCommentParentKey( siteId, postId ) {
	return `${ siteId }-${ postId }`;
}

/***
 * Creates a request id, a concatenation of siteId, postId, and query params basically
 * @param {Number} siteId site identification
 * @param {Number} postId post identification
 * @param {Object} query post identification
 * @returns {String} request id
 */
export function createRequestId( siteId, postId, query ) {
	const queryKeys = Object.keys( query ).sort();
	const queryString = queryKeys.map( ( key ) => `${ key }=${ query[key] }` ).join( '-' );

	return `${siteId}-${postId}-${ queryString }`;
}

/***
 * Builds a comment tree of the shape
 * Map<id, CommentNode> {
 * 	children: List<id>, // Array of root level comments ids
 * }
 * @param {Immutable.List} comments list of comments (as built on state.comments.items) sorted by date in descending order
 * @returns {Immutable.Map} Immutable map comments tree instance of the shape Map<id, CommentNode>{ children: List<id> }
 */
export function buildCommentsTree( comments ) {
	const tree = Immutable.fromJS( { children: [] } );

	return tree.withMutations( ( commentsTree ) => {
		comments.forEach( ( comment ) => {
			// if the comment has a parent, but we haven't seen that parent yet, create a placeholder
			if ( comment.get( 'parent' ) && ! commentsTree.has( comment.getIn( [ 'parent', 'ID' ] ) ) ) {
				commentsTree.set( comment.getIn( [ 'parent', 'ID' ] ), Immutable.fromJS( {
					children: [],
					parentId: undefined,
					data: undefined
				} ) );
			}

			// if it's the first time we see that comment, create it
			if ( ! commentsTree.has( comment.get( 'ID' ) ) ) {
				commentsTree.set( comment.get( 'ID' ), Immutable.fromJS( {
					children: [],
					parentId: comment.get( 'parent' ) ? comment.getIn( [ 'parent', 'ID' ] ) : null,
					data: comment
				} ) );
			} else {
				// we already saw that comment, so it means it's parent of some other comment, so it already has children
				// array, so we need only update the parentId and the data
				const parentId = comment.get( 'parent' ) ? comment.getIn( [ 'parent', 'ID' ] ) : null;

				commentsTree.setIn( [ comment.get( 'ID' ), 'parentId' ], parentId );
				commentsTree.setIn( [ comment.get( 'ID' ), 'data' ], comment );
			}

			if ( comment.get( 'parent' ) ) {
				commentsTree.updateIn( [ comment.getIn( [ 'parent', 'ID' ] ), 'children' ], ( children ) => children.push( comment.get( 'ID' ) ) );
			}

			// We check here for commentNodeChanged in order to not add the comment if we already saw it
			if ( commentsTree.getIn( [ comment.get( 'ID' ), 'parentId' ] ) === null ) {
				commentsTree.update( 'children', ( children ) => children.push( comment.get( 'ID' ) ) );
			}
		} );// forEach comments
	} ); // withMutations
}

/***
 * Finds and modifies item in an Immutable.IndexedIterable
 * @param {Immutable.IndexedIterable} iterable the iterable on which to update
 * @param {Function} predicate function that returns true for an item to modify
 * @param {Function} updater function that returns new value for item
 * @returns {Immutable.IndexedIterable} modified iterable according to updater and predicate
 */
export function updateExistingIn( iterable, predicate, updater ) {
	const index = iterable.findIndex( predicate );

	if ( index === -1 ) {
		return iterable;
	}

	return iterable.update( index, updater );
}
