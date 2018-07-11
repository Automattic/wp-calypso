/** @format */
/**
 * External dependencies
 */
import { compact, find, initial } from 'lodash';

/**
 * Comparator function for sorting formatted ranges
 *
 * A range is considered to be before another range if:
 *   - it's a zero-length range and the other isn't
 *   - it starts before the other
 *   - it has the same start but ends before the other
 *
 * @param {Number} aStart start index of first range
 * @param {Number} aEnd end index of first range
 * @param {Number} bStart start index of second range
 * @param {Number} bEnd end index of second range
 * @returns {Number} -1/0/1 indicating sort order
 */
const rangeSort = ( { indices: [ aStart, aEnd ] }, { indices: [ bStart, bEnd ] } ) => {
	// some "invisible" tokens appear as zero-length ranges
	// at the beginning of certain formatted blocks
	if ( aStart === 0 && aEnd === 0 && bEnd !== 0 ) {
		return -1;
	}

	if ( aStart < bStart ) {
		return -1;
	}

	if ( bStart < aStart ) {
		return 1;
	}

	return bEnd - aEnd;
};

/**
 * Returns a function which will say if another range
 * is "fully contained" within in: if it "encloses"
 *
 * A range is "enclosed" by another range if it falls
 * entirely within the indices of another. Two ranges
 * with the same indices will enclose one another.
 *
 * "inner" is the range under test
 * "outer" is the range that may enclose "inner"
 *
 * The initial "invisible token" ranges are not enclosed
 *
 * @param {Number} innerStart start of possibly-inner range
 * @param {Number} innerEnd end of possibly-inner range
 * @returns {function({indices: Number[]}): Boolean} performs the check
 */
const encloses = ( { indices: [ innerStart, innerEnd ] } ) =>
	/**
	 * Indicates if the given range encloses the first "inner" range
	 *
	 * @param {Number} outerStart start of possibly-outer range
	 * @param {Number} outerEnd end of possibly-outer range
	 * @returns {Boolean} whether the "outer" range encloses the "inner" range
	 */
	( { indices: [ outerStart, outerEnd ] = [ 0, 0 ] } ) =>
		innerStart !== 0 && innerEnd !== 0 && ( outerStart <= innerStart && outerEnd >= innerEnd );

/**
 * Builds a tree of ranges
 * Converts from list of intervals to tree
 *
 * Formats are given as a list of ranges of attributed text.
 * These ranges may nest within each other. We need to be
 * able to transform from the separated list view into the
 * more meaningful list view.
 *
 * This function take a tree of existing ranges, finds the
 * nearest parent range if available, and inserts the given
 * range into the tree.
 *
 * A range is a parent of another if it "encloses" the range.
 *
 * @param {Object[]} ranges the tree of ranges
 * @param {Object} range the range to add
 * @returns {Object[]} the new tree
 */
const addRange = ( ranges, range ) => {
	const parent = find( ranges, encloses( range ) );

	return parent
		? [ ...initial( ranges ), { ...parent, children: addRange( parent.children, range ) } ]
		: [ ...ranges, range ];
};

//
// Range type mappings: extract and normalize necessary data from range objects
//

const commentNode = ( { id: commentId, post_id: postId, site_id: siteId } ) => ( {
	type: 'comment',
	commentId,
	postId,
	siteId,
} );

const linkNode = ( { url } ) => ( { type: 'link', url } );

const postNode = ( { id: postId, site_id: siteId } ) => ( { type: 'post', postId, siteId } );

const siteNode = ( { id: siteId } ) => ( { type: 'site', siteId } );

const typedNode = ( { type } ) => ( { type } );

const userNode = ( { id: userId, name, site_id: siteId } ) => ( {
	type: 'person',
	name,
	siteId,
	userId,
} );

const pluginNode = ( { site_slug, slug, version } ) => ( {
	type: 'plugin',
	siteSlug: site_slug,
	pluginSlug: slug,
	version,
} );

const themeNode = ( { site_slug, slug, version, uri } ) => ( {
	type: 'theme',
	siteSlug: site_slug,
	themeSlug: slug,
	themeUri: uri,
	version,
} );

const inferNode = range => {
	const { type, url } = range;

	if ( type ) {
		return typedNode( range );
	}

	if ( url ) {
		return linkNode( range );
	}

	return range;
};

//
// End of range-type mapping
//

/**
 * Returns function to map range to node
 *
 * @param {String} type type of node specified in range
 * @returns {function(Object): Object} maps block to meta data
 */
const nodeMappings = type => {
	switch ( type ) {
		case 'comment':
			return commentNode;

		case 'post':
			return postNode;

		case 'site':
			return siteNode;

		case 'user':
			return userNode;

		case 'plugin':
			return pluginNode;

		case 'theme':
			return themeNode;

		default:
			return inferNode;
	}
};

/**
 * Creates a node with appropriate properties
 * extracted from text and range information
 *
 * @param {Object|String} text original text message
 * @param {Object} range contains type and meta information
 * @returns {{children: *[]}} new node
 */
const newNode = ( text, range = {} ) => ( {
	...nodeMappings( range.type )( range ),
	children: [ text ],
} );

/**
 * Reducer to combine ongoing results with new results
 *
 * @param {?Array} reduced existing results
 * @param {?Array} remainder new results
 * @returns {Array} combined results
 */
const joinResults = ( [ reduced, remainder ] ) =>
	reduced.length // eslint-disable-line no-nested-ternary
		? compact( reduced.concat( remainder ) )
		: remainder.length
			? [ remainder ]
			: [];

/**
 * Parses a formatted text block into typed nodes
 * Recursive reducer function
 *
 * Note: Although recursive, we don't expect to see
 * large recursion trees here. Most blocks will have
 * on the order of a few ranges at most so there is
 * little fear of overflowing the call stack. If we
 * start parsing more complicated blocks we will need
 * to implement some kind of stack safety here such
 * as the use of a "trampoline".
 *
 * @param {Array} accum.0 previously parsed results
 * @param {String} accum.1 remaining text to parse
 * @param {Number} accum.2 current index into text string
 * @param {Object} nextRange next range from formatted block
 * @returns {Array} parsed results: text and nodes
 */
const parse = ( [ prev, text, offset ], nextRange ) => {
	const {
		indices: [ start, end ],
	} = nextRange;
	const offsetStart = start - offset;
	const offsetEnd = end - offset;

	// Sometimes there's text before the first range
	const preText = offsetStart > 0 ? [ text.slice( 0, offsetStart ) ] : [];

	// recurse into the children of the top-level ranges
	const children = joinResults(
		nextRange.children.reduce( parse, [ [], text.slice( offsetStart, offsetEnd ), start ] )
	);

	const parsed = Object.assign(
		newNode( text.slice( offsetStart, offsetEnd ), nextRange ),
		children.length && { children }
	);

	return [ [ ...prev, ...preText, parsed ], text.slice( offsetEnd ), end ];
};

/**
 * Parses a formatted text block into typed nodes
 *
 * Uses the recursive helper after doing some
 * prep work on the list of block ranges.
 *
 * @see parse
 *
 * @param {Object} block the block to parse
 * @returns {Array} list of text and node segments with children
 */
export const parseBlock = block =>
	block.ranges // is it complex or unformatted text?
		? joinResults(
				block.ranges
					.map( o => ( { ...o, children: [] } ) )
					.sort( rangeSort )
					.reduce( addRange, [] )
					.reduce( parse, [ [], block.text, 0 ] )
		  )
		: [ newNode( block ) ];
