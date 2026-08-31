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
	start: number;
	end: number;
	id?: string | number;
	parent?: string | number | null;
	range?: Range;
	media?: Media;
};

function toSpan( source: Range | Media, isMedia: boolean ): Span {
	const [ start, end ] = source.indices ?? [ 0, 0 ];
	const link = { start, end, id: source.id, parent: source.parent };
	return isMedia ? { ...link, media: source as Media } : { ...link, range: source as Range };
}

// How deeply the payload nests this span, following `parent` while the ancestor
// is present. A span must be built before anything it contains, whatever their
// lengths, or a container declared around a zero-length span closes empty.
function nestingDepth( span: Span, byId: Map< string | number, Span > ): number {
	let depth = 0;
	let parent = span.parent != null ? byId.get( span.parent ) : undefined;
	while ( parent && depth <= byId.size ) {
		depth++;
		parent = parent.parent != null ? byId.get( parent.parent ) : undefined;
	}
	return depth;
}

function toNode( span: Span, text: string, children: RichNode[] ): RichNode {
	if ( span.media ) {
		return {
			kind: 'image',
			imageType: span.media.type,
			url: span.media.url,
			alt: text.slice( span.start, span.end ).trim(),
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

function build( text: string, start: number, end: number, spans: Span[] ): RichNode[] {
	const nodes: RichNode[] = [];
	let cursor = start;
	let i = 0;
	while ( i < spans.length ) {
		const span = spans[ i ];
		i++;
		if ( span.start < cursor || span.end > end ) {
			continue;
		}
		if ( span.start > cursor ) {
			nodes.push( { kind: 'text', text: text.slice( cursor, span.start ) } );
		}
		const children: Span[] = [];
		const contains = ( other: Span ) =>
			( other.parent != null && other.parent === span.id ) ||
			( other.start < span.end && other.end <= span.end );
		while ( i < spans.length && ( spans[ i ].start < span.end || contains( spans[ i ] ) ) ) {
			if ( contains( spans[ i ] ) ) {
				children.push( spans[ i ] );
			}
			i++;
		}
		nodes.push( toNode( span, text, build( text, span.start, span.end, children ) ) );
		cursor = span.end;
	}
	if ( cursor < end ) {
		nodes.push( { kind: 'text', text: text.slice( cursor, end ) } );
	}
	return nodes;
}

/**
 * Nested display tree for a block's text, ranges, and media — the pure
 * counterpart of the panel's `indices-to-html` renderer. Overlapping spans
 * keep the earlier/longer one; zero-length spans (inline icons) sort before
 * content spans starting at the same position, matching the panel.
 */
export function getRichNodes( block: Block ): RichNode[] {
	const isZero = ( s: Span ) => ( s.end - s.start === 0 ? 0 : 1 );
	const candidates = [
		...( block.ranges ?? [] ).map( ( range ) => toSpan( range, false ) ),
		...( block.media ?? [] ).map( ( media ) => toSpan( media, true ) ),
	].filter( ( s ) => s.start >= 0 && s.end >= s.start && s.end <= block.text.length );

	const byId = new Map< string | number, Span >();
	for ( const span of candidates ) {
		if ( span.id != null ) {
			byId.set( span.id, span );
		}
	}
	const depths = new Map< Span, number >(
		candidates.map( ( s ) => [ s, nestingDepth( s, byId ) ] )
	);

	const spans = candidates.sort(
		( a, b ) =>
			a.start - b.start ||
			( depths.get( a ) ?? 0 ) - ( depths.get( b ) ?? 0 ) ||
			isZero( a ) - isZero( b ) ||
			b.end - b.start - ( a.end - a.start )
	);
	return build( block.text, 0, block.text.length, spans );
}
