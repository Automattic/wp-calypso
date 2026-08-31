import type { Block, Media, Range } from './types';

export type RichNode =
	| { kind: 'text'; text: string }
	| { kind: 'element'; type: string; url?: string; children: RichNode[] }
	| {
			kind: 'image';
			imageType: Media[ 'type' ];
			url: string;
			alt: string;
			width?: string | number;
			height?: string | number;
	  }
	| { kind: 'icon'; value: string };

type Span = {
	id?: string | number;
	parent?: string | number | null;
	range?: Range;
	media?: Media;
};

// One applicable span at one text position, as the panel's index map holds it.
type Entry = {
	id?: string | number;
	parent?: string | number | null;
	len: number;
	span: Span;
};

function toNode( span: Span, text: string, children: RichNode[] ): RichNode {
	if ( span.media ) {
		return {
			kind: 'image',
			imageType: span.media.type,
			url: span.media.url,
			alt: text.trim(),
			width: span.media.width,
			height: span.media.height,
		};
	}
	const range = span.range as Range;
	if ( range.type === 'noticon' && range.value ) {
		return { kind: 'icon', value: range.value };
	}
	return {
		kind: 'element',
		type: range.type ?? ( range.url ? 'link' : 'span' ),
		url: range.url,
		children,
	};
}

function pushText( nodes: RichNode[], text: string ) {
	if ( text ) {
		nodes.push( { kind: 'text', text } );
	}
}

/**
 * Walk one depth of the index map, emitting text between spans and recursing
 * into each span that starts here. Ported from the panel's `build_chunks`; the
 * selection rules below are what keep nesting faithful to the payload.
 */
function buildChunks( text: string, positions: Entry[][] ): RichNode[] {
	const nodes: RichNode[] = [];
	const remaining = positions.map( ( entries ) => entries.slice() );
	let textStart: number | null = null;

	for ( let i = 0; i < positions.length; i++ ) {
		if ( remaining[ i ].length === 0 ) {
			if ( textStart === null ) {
				textStart = i;
			}
			continue;
		}

		if ( textStart !== null ) {
			pushText( nodes, text.substring( textStart, i ) );
			textStart = null;
		}

		let picked: Entry | null = null;
		for ( const candidate of remaining[ i ] ) {
			// Recursion has to start at the outermost span, so anything whose
			// parent is also here waits to be reached from inside that parent.
			if (
				candidate.parent != null &&
				remaining[ i ].some( ( entry ) => entry.id === candidate.parent )
			) {
				continue;
			}
			// An empty span wins, or it would be swallowed by a sibling that
			// happens to start at the same place.
			if ( candidate.len === 0 ) {
				picked = candidate;
				break;
			}
			if ( picked === null || candidate.len > picked.len ) {
				picked = candidate;
			}
		}

		if ( picked === null ) {
			remaining[ i ] = [];
			i--;
			continue;
		}

		// An empty span still descends one position, which is how a link
		// wrapping nothing but an image reaches that image.
		const width = picked.len > 0 ? picked.len : 1;
		const innerText = text.substr( i, picked.len );
		const inner = positions
			.slice( i, i + width )
			.map( ( entries ) => entries.filter( ( entry ) => picked?.parent !== entry.parent ) );

		nodes.push( toNode( picked.span, innerText, buildChunks( innerText, inner ) ) );

		remaining[ i ] = remaining[ i ].filter( ( entry ) => entry.len > 0 );
		i += picked.len - 1;
	}

	if ( textStart !== null ) {
		pushText( nodes, text.substring( textStart ) );
	}

	return nodes;
}

/**
 * Nested display tree for a block's text, ranges, and media — the pure
 * counterpart of the panel's `indices-to-html` renderer, built from the same
 * index map so both surfaces nest a payload the same way.
 */
export function getRichNodes( block: Block ): RichNode[] {
	const text = block.text ?? '';
	const spans: Span[] = [
		...( block.ranges ?? [] ).map( ( range ) => ( {
			id: range.id,
			parent: range.parent,
			range,
		} ) ),
		...( block.media ?? [] ).map( ( media ) => ( {
			id: media.id,
			parent: media.parent,
			media,
		} ) ),
	];

	const positions: Entry[][] = [];
	for ( let i = 0; i < Math.max( text.length, 1 ); i++ ) {
		positions[ i ] = [];
	}

	const sources = [ ...( block.ranges ?? [] ), ...( block.media ?? [] ) ];
	sources.forEach( ( source, index ) => {
		const [ start, stop ] = source.indices ?? [ 0, 0 ];
		if ( start < 0 || stop < start || stop > text.length ) {
			return;
		}
		const entry = { id: source.id, parent: source.parent, span: spans[ index ] };
		if ( stop > start ) {
			for ( let i = start; i < stop && i < positions.length; i++ ) {
				positions[ i ].push( { ...entry, len: stop - start } );
			}
			return;
		}
		if ( ! positions[ start ] ) {
			positions[ start ] = [];
		}
		positions[ start ].push( { ...entry, len: 0 } );
	} );

	return buildChunks( text, positions );
}
