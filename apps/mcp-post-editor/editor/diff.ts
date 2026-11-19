import sanitize from './sanitize';

export type DiffPart = { type: 'same' | 'removed' | 'added'; text: string };

// Elements whose text reads as separate words from the text after them.
const BREAKS = 'p, li, h1, h2, h3, h4, h5, h6, figcaption, td, th, br, div, blockquote, pre';
// Above this many word pairs, the diff shows the whole text as removed and added.
const MAX_CELLS = 250000;

// The words a reader sees in block markup. The markup is sanitized and parsed in a document
// that isn't shown, so nothing in it loads or runs.
export function textOf( html: string ) {
	const doc = new DOMParser().parseFromString( sanitize( html ), 'text/html' );
	doc.body.querySelectorAll( BREAKS ).forEach( ( element ) => element.after( ' ' ) );
	return ( doc.body.textContent ?? '' ).replace( /\s+/g, ' ' ).trim();
}

// A word-level diff of two texts, from the longest run of words they share.
export function diffWords( before: string, after: string ): DiffPart[] {
	const a = before.split( /\s+/ ).filter( Boolean );
	const b = after.split( /\s+/ ).filter( Boolean );
	const parts: DiffPart[] = [];
	const add = ( type: DiffPart[ 'type' ], word: string ) => {
		const last = parts[ parts.length - 1 ];
		if ( last?.type === type ) {
			last.text += ` ${ word }`;
		} else {
			parts.push( { type, text: word } );
		}
	};
	if ( a.length * b.length > MAX_CELLS ) {
		a.forEach( ( word ) => add( 'removed', word ) );
		b.forEach( ( word ) => add( 'added', word ) );
		return parts;
	}
	// common[ i ][ j ]: the longest common run of a[ i.. ] and b[ j.. ].
	const common = Array.from( { length: a.length + 1 }, () =>
		new Array< number >( b.length + 1 ).fill( 0 )
	);
	for ( let i = a.length - 1; i >= 0; i-- ) {
		for ( let j = b.length - 1; j >= 0; j-- ) {
			common[ i ][ j ] =
				a[ i ] === b[ j ]
					? common[ i + 1 ][ j + 1 ] + 1
					: Math.max( common[ i + 1 ][ j ], common[ i ][ j + 1 ] );
		}
	}
	let i = 0;
	let j = 0;
	while ( i < a.length || j < b.length ) {
		if ( i < a.length && j < b.length && a[ i ] === b[ j ] ) {
			add( 'same', a[ i ] );
			i++;
			j++;
		} else if (
			j >= b.length ||
			( i < a.length && common[ i + 1 ][ j ] >= common[ i ][ j + 1 ] )
		) {
			add( 'removed', a[ i++ ] );
		} else {
			add( 'added', b[ j++ ] );
		}
	}
	return parts;
}
