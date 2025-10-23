/**
 * formatted-block-parser rewrites activity log payloads from the API into a tree of
 * nodes that the FormattedBlock renderer understands. It nests overlapping ranges so we can apply
 * multiple decorators (links, emphasis, entity references) to the same slice of copy.
 *
 * Example:
 * parseActivityLogEntryContent({
 * 	text: 'Site Example updated',
 * 	ranges: [ { indices: [ 5, 12 ], type: 'site', id: 987, section: 'sites' } ],
 * });
 * // Returns:
 * // [
 * // 	'Site ',
 * // 	{ type: 'site', id: 987, text: 'Example', children: [ 'Example' ] },
 * // 	' updated',
 * // ]
 * // Rendered by FormattedBlock as:
 * // Site <a href="/sites/987">Example</a> updated
 */
import type { ActivityBlockContent, ActivityBlockNode } from './types';
import type { ActivityNotificationRange, ActivityLogEntry } from '@automattic/api-core';
interface RangeWithChildren extends ActivityNotificationRange {
	children: RangeWithChildren[];
	[ key: string ]: unknown;
}

type ParseState = [ ActivityBlockContent[], string, number ];

type RangePredicate = ( range: RangeWithChildren ) => boolean;

const isNonEmpty = < T >( value: T | null | undefined | false | '' ): value is T =>
	Boolean( value );

const rangeSort = (
	{ indices: [ aStart, aEnd ] }: RangeWithChildren,
	{ indices: [ bStart, bEnd ] }: RangeWithChildren
) => {
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

const encloses =
	( { indices: [ innerStart, innerEnd ] }: RangeWithChildren ): RangePredicate =>
	( { indices: [ outerStart = 0, outerEnd = 0 ] = [ 0, 0 ] } ) =>
		innerStart !== 0 && innerEnd !== 0 && outerStart <= innerStart && outerEnd >= innerEnd;

const addRange = ( ranges: RangeWithChildren[], range: RangeWithChildren ): RangeWithChildren[] => {
	const parentIndex = [ ...ranges ]
		.reverse()
		.findIndex( ( candidate ) => encloses( range )( candidate ) );

	if ( parentIndex === -1 ) {
		return [ ...ranges, range ];
	}

	const actualIndex = ranges.length - 1 - parentIndex;
	const parent = ranges[ actualIndex ];
	const updatedChildren = addRange( parent.children, range );
	const updatedParent: RangeWithChildren = {
		...parent,
		children: updatedChildren,
	};

	return [ ...ranges.slice( 0, actualIndex ), updatedParent, ...ranges.slice( actualIndex + 1 ) ];
};

const commentNode = ( {
	id: commentId,
	post_id: postId,
	site_id: siteId,
}: RangeWithChildren ) => ( {
	type: 'comment',
	commentId,
	postId,
	siteId,
} );

const linkNode = ( { url, intent, section }: RangeWithChildren ) => ( {
	type: 'link',
	url,
	intent,
	section,
} );

const postNode = ( { id: postId, site_id: siteId, published }: RangeWithChildren ) => ( {
	type: 'post',
	postId,
	siteId,
	published,
} );

const siteNode = ( { id: siteId, intent, section }: RangeWithChildren ) => ( {
	type: 'site',
	siteId,
	intent,
	section,
} );

const userNode = ( {
	id: userId,
	name,
	site_id: siteId,
	intent,
	section,
}: RangeWithChildren ) => ( {
	type: 'person',
	name,
	siteId,
	userId,
	intent,
	section,
} );

const pluginNode = ( {
	site_slug: siteSlug,
	slug,
	version,
	intent,
	section,
}: RangeWithChildren ) => ( {
	type: 'plugin',
	siteSlug,
	pluginSlug: slug,
	version,
	intent,
	section,
} );

const themeNode = ( {
	site_slug: siteSlug,
	slug,
	version,
	uri,
	intent,
	section,
}: RangeWithChildren ) => ( {
	type: 'theme',
	siteSlug,
	themeSlug: slug,
	themeUri: uri,
	version,
	intent,
	section,
} );

const backupNode = ( {
	site_slug: siteSlug,
	rewind_id: rewindId,
	intent,
	section,
}: RangeWithChildren ) => ( {
	type: 'backup',
	siteSlug,
	rewindId,
	intent,
	section,
} );

const inferNode = ( range: RangeWithChildren ) => {
	if ( range.url ) {
		return linkNode( range );
	}

	if ( range.type ) {
		return { type: range.type };
	}

	return range;
};

const nodeMappings = ( type?: string ) => {
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
		case 'backup':
			return backupNode;
		default:
			return inferNode;
	}
};

const newNode = ( text: string, range: RangeWithChildren ): ActivityBlockNode => ( {
	...nodeMappings( range.type )( range ),
	text,
	children: text ? [ text ] : [],
} );

const joinResults = ( [ reduced, remainder ]: [
	ActivityBlockContent[],
	string,
] ): ActivityBlockContent[] => {
	if ( reduced.length ) {
		return [ ...reduced, remainder ].filter( isNonEmpty );
	}

	return remainder ? [ remainder ] : [];
};

const parseRange = (
	[ prev, text, offset ]: ParseState,
	nextRange: RangeWithChildren
): ParseState => {
	const {
		indices: [ start, end ],
	} = nextRange;
	const offsetStart = start - offset;
	const offsetEnd = end - offset;
	const preText = offsetStart > 0 ? [ text.slice( 0, offsetStart ) ] : [];
	const innerText = text.slice( offsetStart, offsetEnd );
	const [ childReduced, childRemainder ] = nextRange.children.reduce< ParseState >(
		( state, range ) => parseRange( state, range ),
		[ [], innerText, start ]
	);
	const parsedChildren = joinResults( [ childReduced, childRemainder ] );
	const baseNode = newNode( innerText, nextRange );
	const parsedNode: ActivityBlockNode = parsedChildren.length
		? { ...baseNode, children: parsedChildren }
		: baseNode;

	return [ [ ...prev, ...preText, parsedNode ], text.slice( offsetEnd ), end ];
};

export const parseActivityLogEntryContent = (
	content?: string | ActivityLogEntry[ 'content' ]
): ActivityBlockContent[] => {
	if ( typeof content === 'string' ) {
		return content ? [ content ] : [];
	}

	if ( Array.isArray( content ) ) {
		return content;
	}

	if ( ! content ) {
		return [];
	}
	const { text = '' } = content;

	// In case the ActivityLogEntry content has no ranges, return early.
	if ( ! content.ranges || ! content.ranges.length ) {
		return text ? [ text ] : [];
	}

	const rangesWithChildren = content.ranges
		.map< RangeWithChildren >( ( range ) => ( {
			...range,
			children: [] as RangeWithChildren[],
		} ) )
		.sort( rangeSort )
		.reduce( addRange, [] as RangeWithChildren[] );

	const [ reduced, remainder ] = rangesWithChildren.reduce< ParseState >(
		( state, range ) => parseRange( state, range ),
		[ [], text, 0 ]
	);

	return joinResults( [ reduced, remainder ] );
};

export default parseActivityLogEntryContent;
