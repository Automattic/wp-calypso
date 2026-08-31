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
	range?: Range;
	media?: Media;
};

function toSpan( source: Range | Media, isMedia: boolean ): Span {
	const [ start, end ] = source.indices ?? [ 0, 0 ];
	return isMedia ? { start, end, media: source as Media } : { start, end, range: source as Range };
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
		while ( i < spans.length && spans[ i ].start < span.end ) {
			if ( spans[ i ].end <= span.end ) {
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
	const spans = [
		...( block.ranges ?? [] ).map( ( range ) => toSpan( range, false ) ),
		...( block.media ?? [] ).map( ( media ) => toSpan( media, true ) ),
	]
		.filter( ( s ) => s.start >= 0 && s.end >= s.start && s.end <= block.text.length )
		.sort(
			( a, b ) =>
				a.start - b.start || isZero( a ) - isZero( b ) || b.end - b.start - ( a.end - a.start )
		);
	return build( block.text, 0, block.text.length, spans );
}
