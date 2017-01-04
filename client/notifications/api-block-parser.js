import {
	complement,
	flip,
	init,
	isEmpty,
	propOr
} from 'ramda';

const notEmpty = complement( isEmpty );

const rangeSort = ( { indices: [ aStart, aEnd ] }, { indices: [ bStart, bEnd ] } ) => {
	if ( aStart === 0 && aEnd === 0 && bEnd !== 0 ) return -1;

	if ( aStart < bStart ) return -1;
	if ( bStart < aStart ) return 1;

	return bEnd - aEnd;
};

const encloses =
	( { indices: [ innerStart, innerEnd ] } ) =>
		( { indices: [ outerStart, outerEnd ] = [ 0, 0 ]} ) =>
		( innerStart !== 0 && innerEnd !== 0 ) &&
		( outerStart <= innerStart && outerEnd >= innerEnd );

const addRange = ( ranges, range ) => {
	const parent = ranges.find( encloses( range ) );

	if ( ! parent ) return [ ...ranges, range ];

	return [
		...init( ranges ),
		{ ...parent, children: addRange( parent.children, range ) }
	];
};

const commentNode = ( { id: commentId, post_id: postId, site_id: siteId } ) =>
	( { type: 'comment', commentId, postId, siteId } );

const linkNode = ( { url } ) =>
	( { type: 'link', url } );

const postNode = ( { id: postId, site_id: siteId } ) =>
	( { type: 'post', postId, siteId } );

const siteNode = ( { id: siteId } ) =>
	( { type: 'site', siteId } );

const typedNode = ( { type } ) =>
	( { type } );

const userNode = ( { id } ) =>
	( { type: 'user', id } );

const inferNode = range => {
	const { type, url } = range;

	if ( type ) return typedNode( range );

	if ( url ) return linkNode( range );

	return range;
};

const nodeMappings = flip( propOr( inferNode ) )( {
	comment: commentNode,
	post: postNode,
	site: siteNode,
	user: userNode
} );

const newNode = ( text, range = {} ) => ( {
	...nodeMappings( range.type )( range ),
	children: [ text ]
} );

const joinResults = ( [ reduced, remainder, ] ) =>
	reduced.length
		? reduced.concat( remainder ).filter( notEmpty )
		: remainder.length ? [ remainder ] : [];

const parse = ( [ prev, text, offset ], nextRange ) => {
	const { indices: [ start, end ] } = nextRange;
	const offsetStart = start - offset;
	const offsetEnd = end - offset;

	const preText = ( offsetStart > 0 ) ? [ text.slice( 0, offsetStart ) ] : [];

	const children = joinResults(
		nextRange
			.children
			.reduce( parse, [ [], text.slice( offsetStart, offsetEnd ), start ] )
	);

	const parsed = Object.assign(
		newNode( text.slice( offsetStart, offsetEnd ), nextRange ),
		children.length && { children }
	);

	return [ [ ...prev, ...preText, parsed ], text.slice( offsetEnd ), end ];
};

export const parseBlock = block =>
	block.ranges
		? joinResults(
		block.ranges
			.map( o => ( { ...o, children: [] } ) )
			.sort( rangeSort )
			.reduce( addRange, [] )
			.reduce( parse, [ [], block.text, 0 ] ) )
		: [ newNode( block ) ];

export default parseBlock;
