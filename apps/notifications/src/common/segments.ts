import type { Block, Note } from './types';

const TITLE_BOLD_RANGE_TYPES = new Set( [ 'user', 'post', 'b' ] );

export type TitleSegment = { text: string; bold: boolean; url: string | null };

/**
 * The title split into spans, following the subject's ranges: user/post ranges
 * are bold, and any range's URL rides along so a detail pane can embed links
 * (a list can render the same segments without them).
 */
export function getTitleSegments( note: Note ): TitleSegment[] {
	const block = note.subject[ 0 ];
	if ( ! block ) {
		return [ { text: note.title, bold: false, url: null } ];
	}

	const markedRanges = ( block.ranges ?? [] )
		.filter(
			( range ) =>
				( TITLE_BOLD_RANGE_TYPES.has( range.type ) || !! range.url ) &&
				range.indices[ 1 ] > range.indices[ 0 ]
		)
		.sort( ( a, b ) => a.indices[ 0 ] - b.indices[ 0 ] );

	const segments: TitleSegment[] = [];
	let cursor = 0;
	for ( const range of markedRanges ) {
		const [ start, end ] = range.indices;
		if ( start < cursor || end > block.text.length ) {
			continue;
		}
		if ( start > cursor ) {
			segments.push( { text: block.text.slice( cursor, start ), bold: false, url: null } );
		}
		segments.push( {
			text: block.text.slice( start, end ),
			bold: TITLE_BOLD_RANGE_TYPES.has( range.type ),
			url: range.url ?? null,
		} );
		cursor = end;
	}
	if ( cursor < block.text.length ) {
		segments.push( { text: block.text.slice( cursor ), bold: false, url: null } );
	}
	return segments;
}

export type BlockSegment = { text: string; url?: string; type?: string };

/**
 * Split a block's text into plain and linked segments using its `ranges`
 * (substring offsets from the API). Overlapping or nested ranges keep the
 * first; ranges without a URL don't affect the text.
 */
export function getBlockSegments( block: Block ): BlockSegment[] {
	const linkRanges = ( block.ranges ?? [] )
		.filter( ( range ) => !! range.url && range.indices[ 1 ] > range.indices[ 0 ] )
		.sort( ( a, b ) => a.indices[ 0 ] - b.indices[ 0 ] );

	const segments: BlockSegment[] = [];
	let cursor = 0;
	for ( const range of linkRanges ) {
		const [ start, end ] = range.indices;
		if ( start < cursor || end > block.text.length ) {
			continue;
		}
		if ( start > cursor ) {
			segments.push( { text: block.text.slice( cursor, start ) } );
		}
		segments.push( { text: block.text.slice( start, end ), url: range.url, type: range.type } );
		cursor = end;
	}
	if ( cursor < block.text.length ) {
		segments.push( { text: block.text.slice( cursor ) } );
	}
	return segments;
}
