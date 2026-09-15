/**
 * Block markup as it streams: finding the complete blocks in a buffer that ends
 * mid-block, and turning them into blocks the editor accepts.
 */

import { createBlock, getBlockType, parse, serialize, validateBlock } from '@wordpress/blocks';
import type { EditorBlock } from '../../utils/editor-blocks';
import type { Block } from '@wordpress/blocks';

/**
 * Runs `callback` with block-validation console output silenced. Every streamed
 * frame is parsed and re-serialized, and each pass would otherwise log a
 * warning for every block the model wrote slightly off.
 */
export function withSuppressedValidationLogs< T >( callback: () => T ): T {
	const { warn, error } = window.console;
	const isValidationLog = ( args: unknown[] ) =>
		args.some(
			( arg ) =>
				typeof arg === 'string' &&
				( arg.includes( 'Block validation:' ) || arg.includes( 'Block validation failed for' ) )
		);

	window.console.warn = ( ...args: unknown[] ) => {
		if ( ! isValidationLog( args ) ) {
			warn.apply( window.console, args );
		}
	};
	window.console.error = ( ...args: unknown[] ) => {
		if ( ! isValidationLog( args ) ) {
			error.apply( window.console, args );
		}
	};

	try {
		return callback();
	} finally {
		window.console.warn = warn;
		window.console.error = error;
	}
}

/** Drops blocks with no clientId or name, at any depth, so `serialize` cannot throw on them. */
export function sanitizeBlockTree( blocks: EditorBlock[] ): EditorBlock[] {
	return blocks
		.filter( ( block ) => !! block?.clientId && !! block.name )
		.map( ( block ) =>
			block.innerBlocks.length
				? { ...block, innerBlocks: sanitizeBlockTree( block.innerBlocks ) }
				: block
		);
}

function parseAttributes( attributes: string | undefined ): Record< string, string > {
	const parsed: Record< string, string > = {};

	if ( ! attributes ) {
		return parsed;
	}

	for ( const match of attributes.matchAll( /(\S+)="([^"]*)"/g ) ) {
		parsed[ match[ 1 ] ] = match[ 2 ];
	}

	for ( const match of attributes.matchAll( /(\S+)='([^']*)'/g ) ) {
		if ( ! ( match[ 1 ] in parsed ) ) {
			parsed[ match[ 1 ] ] = match[ 2 ];
		}
	}

	return parsed;
}

// Classes unioned, styles merged per property, other keys from the outer.
function mergeAttributes(
	outerAttributes: string,
	innerAttributes: string
): Record< string, string > {
	const outer = parseAttributes( outerAttributes );
	const inner = parseAttributes( innerAttributes );
	const merged = { ...outer };

	for ( const [ key, value ] of Object.entries( inner ) ) {
		if ( key === 'class' ) {
			const classes = [ ...( outer.class ?? '' ).split( /\s+/ ), ...value.split( /\s+/ ) ].filter(
				Boolean
			);

			merged.class = [ ...new Set( classes ) ].join( ' ' );
		} else if ( key === 'style' ) {
			const styles: Record< string, string > = {};

			for ( const declaration of [
				...( outer.style ?? '' ).split( ';' ),
				...value.split( ';' ),
			] ) {
				const colon = declaration.indexOf( ':' );

				if ( colon > 0 ) {
					styles[ declaration.slice( 0, colon ).trim() ] = declaration.slice( colon + 1 ).trim();
				}
			}

			merged.style = Object.entries( styles )
				.map( ( [ property, styleValue ] ) => `${ property }:${ styleValue }` )
				.join( ';' );
		} else if ( ! ( key in outer ) ) {
			merged[ key ] = value;
		}
	}

	return merged;
}

const serializeAttributes = ( attributes: Record< string, string > ): string =>
	Object.entries( attributes )
		.map( ( [ key, value ] ) => ` ${ key }="${ value }"` )
		.join( '' );

/** Collapses a paragraph the model nested inside another, which the paragraph block refuses. */
export function fixNestedParagraphs( markup: string ): string {
	if ( ! markup.includes( '<!-- wp:paragraph' ) ) {
		return markup;
	}

	const nested = /<p(\s[^>]*)?>(\s*)<p(\s[^>]*)?>([^]*?)<\/p>(\s*)<\/p>/gi;

	return markup.replace(
		/(<!-- wp:paragraph[^>]*-->)([\s\S]*?)(<!-- \/wp:paragraph -->)/g,
		( _match, open: string, content: string, close: string ) => {
			let fixed = content;
			let previous: string;

			do {
				previous = fixed;
				fixed = fixed.replace(
					nested,
					( _nested: string, outer = '', _space: string, inner = '', text: string ) =>
						`<p${ serializeAttributes( mergeAttributes( outer, inner ) ) }>${ text }</p>`
				);
			} while ( fixed !== previous );

			return `${ open }${ fixed }${ close }`;
		}
	);
}

function isValidBlock( block: EditorBlock ): boolean {
	const blockType = getBlockType( block.name );

	if ( ! blockType ) {
		return false;
	}

	const [ isValid ] = withSuppressedValidationLogs( () =>
		validateBlock( block as Block, blockType )
	);

	return isValid;
}

// A block the editor would refuse is rebuilt from its attributes, which keeps
// the content and drops the markup the model got wrong.
function repairBlock( block: EditorBlock ): { block: EditorBlock; repaired: boolean } {
	if ( ! block?.name ) {
		return { block, repaired: false };
	}

	let innerRepaired = false;
	const innerBlocks = block.innerBlocks.map( ( inner ) => {
		const result = repairBlock( inner );

		innerRepaired ||= result.repaired;

		return result.block;
	} );
	const candidate = { ...block, innerBlocks };

	if ( ! innerRepaired && isValidBlock( candidate ) ) {
		return { block: candidate, repaired: false };
	}

	const rebuilt = createBlock(
		candidate.name,
		candidate.attributes,
		innerBlocks.length ? ( innerBlocks as Block[] ) : undefined
	) as EditorBlock;

	return { block: rebuilt, repaired: true };
}

/** The blocks of a complete piece of markup, each repaired where the editor would refuse it. */
export function repairBlocksFromMarkup( markup: string ): EditorBlock[] {
	const parsed = withSuppressedValidationLogs( () =>
		parse( fixNestedParagraphs( markup ) )
	) as EditorBlock[];

	if ( ! parsed.length ) {
		return [];
	}

	const repaired = parsed.map( ( block ) => repairBlock( block ).block );
	const normalized = withSuppressedValidationLogs( () => serialize( repaired as Block[] ) );

	return withSuppressedValidationLogs( () =>
		parse( fixNestedParagraphs( normalized ) )
	) as EditorBlock[];
}

interface ParsedBlockComment {
	blockName: string;
	attributes: Record< string, unknown >;
	isSelfClosing: boolean;
}

/** An opening block delimiter taken apart, or `null` for a closing one or a plain comment. */
export function parseBlockComment( comment: string ): ParsedBlockComment | null {
	const inner = comment
		.replace( /^<!--\s*/, '' )
		.replace( /\s*-->$/, '' )
		.trim();

	if ( ! inner.startsWith( 'wp:' ) ) {
		return null;
	}

	const match = /^wp:([^\s]+)(?:\s+([\s\S]*?))?\s*(\/)?$/.exec( inner );

	if ( ! match ) {
		return null;
	}

	let attributes: Record< string, unknown > = {};
	const rawAttributes = ( match[ 2 ] ?? '' ).trim();

	if ( rawAttributes ) {
		try {
			attributes = JSON.parse( rawAttributes );
		} catch {
			attributes = {};
		}
	}

	return {
		blockName: match[ 1 ].includes( '/' ) ? match[ 1 ] : `core/${ match[ 1 ] }`,
		attributes,
		isSelfClosing: !! match[ 3 ],
	};
}

// Their body is opaque markup that may itself contain delimiter-looking text,
// so the scanner jumps straight to their closing delimiter.
const RAW_CONTENT_BLOCK_NAMES = [ 'core/html', 'core/freeform', 'core/code', 'core/preformatted' ];

// The index just past the `}` matching the `{` at `start`, skipping braces and
// `-->` inside JSON strings. -1 while the object is still streaming.
function skipJsonObject( buffer: string, start: number ): number {
	let depth = 0;
	let inString = false;
	let escaped = false;

	for ( let index = start; index < buffer.length; index++ ) {
		const char = buffer[ index ];

		if ( inString ) {
			if ( escaped ) {
				escaped = false;
			} else if ( char === '\\' ) {
				escaped = true;
			} else if ( char === '"' ) {
				inString = false;
			}
		} else if ( char === '"' ) {
			inString = true;
		} else if ( char === '{' ) {
			depth += 1;
		} else if ( char === '}' && --depth === 0 ) {
			return index + 1;
		}
	}

	return -1;
}

interface BlockDelimiter {
	kind: 'open' | 'close' | 'self-closing' | 'comment';
	rawName: string | null;
	blockName: string | null;
	end: number;
}

const skipWhitespace = ( buffer: string, index: number ): number => {
	while ( index < buffer.length && /\s/.test( buffer[ index ] ) ) {
		index += 1;
	}

	return index;
};

// The delimiter or plain comment starting at `start`, or `null` while it is
// still streaming. The attribute JSON is skipped brace-aware, so a `-->` inside
// an attribute value does not end the comment early.
function readBlockDelimiter( buffer: string, start: number ): BlockDelimiter | null {
	let index = skipWhitespace( buffer, start + '<!--'.length );
	const isClosing = buffer.startsWith( '/wp:', index );
	const isOpening = ! isClosing && buffer.startsWith( 'wp:', index );

	if ( ! isClosing && ! isOpening ) {
		const end = buffer.indexOf( '-->', index );

		return end === -1 ? null : { kind: 'comment', rawName: null, blockName: null, end: end + 3 };
	}

	index += isClosing ? '/wp:'.length : 'wp:'.length;

	const name = /^[a-zA-Z][a-zA-Z0-9-]*(?:\/[a-zA-Z][a-zA-Z0-9-]*)?/.exec(
		buffer.slice( index, index + 200 )
	);

	if ( ! name ) {
		return null;
	}

	const rawName = name[ 0 ];
	const blockName = rawName.includes( '/' ) ? rawName : `core/${ rawName }`;

	index += rawName.length;

	if ( isClosing ) {
		const end = buffer.indexOf( '-->', index );

		return end === -1 ? null : { kind: 'close', rawName, blockName, end: end + 3 };
	}

	index = skipWhitespace( buffer, index );

	if ( buffer[ index ] === '{' ) {
		const jsonEnd = skipJsonObject( buffer, index );

		if ( jsonEnd === -1 ) {
			return null;
		}

		index = skipWhitespace( buffer, jsonEnd );
	}

	let selfClosing = false;

	if ( buffer[ index ] === '/' ) {
		selfClosing = true;
		index = skipWhitespace( buffer, index + 1 );
	}

	if ( ! buffer.startsWith( '-->', index ) ) {
		return null;
	}

	return {
		kind: selfClosing ? 'self-closing' : 'open',
		rawName,
		blockName,
		end: index + '-->'.length,
	};
}

// The index just past a raw-content block's closing delimiter, or -1 while it is still streaming.
function findRawContentBlockEnd( buffer: string, from: number, rawName: string ): number {
	const close = new RegExp( `<!--\\s*/wp:${ rawName }\\s*-->`, 'g' );

	close.lastIndex = from;

	const match = close.exec( buffer );

	return match ? match.index + match[ 0 ].length : -1;
}

/**
 * The first complete top-level block in a buffer that may end mid-block, with
 * what follows it, or `null` while it is still streaming. Text before the first
 * delimiter is a container's own wrapper HTML arriving ahead of its children,
 * and is never taken for a block of its own.
 */
export function extractCompleteTopLevelBlock(
	buffer: string
): { blockMarkup: string; remaining: string } | null {
	const trimmed = buffer.replace( /^\s+/, '' );
	const firstBlock = /<!--\s*wp:/i.exec( trimmed );

	if ( ! firstBlock ) {
		return null;
	}

	const markup = trimmed.slice( firstBlock.index );
	const complete = ( end: number ) => ( {
		blockMarkup: markup.slice( 0, end ),
		remaining: markup.slice( end ),
	} );
	let position = 0;
	let depth = 0;

	while ( position < markup.length ) {
		const commentStart = markup.indexOf( '<!--', position );

		if ( commentStart === -1 ) {
			return null;
		}

		const delimiter = readBlockDelimiter( markup, commentStart );

		if ( ! delimiter ) {
			return null;
		}

		if (
			delimiter.kind === 'open' &&
			delimiter.blockName &&
			RAW_CONTENT_BLOCK_NAMES.includes( delimiter.blockName )
		) {
			const closeEnd = findRawContentBlockEnd( markup, delimiter.end, delimiter.rawName as string );

			if ( closeEnd === -1 ) {
				return null;
			}

			if ( depth === 0 ) {
				return complete( closeEnd );
			}

			position = closeEnd;
			continue;
		}

		if ( delimiter.kind === 'self-closing' && depth === 0 ) {
			return complete( delimiter.end );
		}

		if ( delimiter.kind === 'open' ) {
			depth += 1;
		} else if ( delimiter.kind === 'close' && depth > 0 && --depth === 0 ) {
			return complete( delimiter.end );
		}

		position = delimiter.end;
	}

	return null;
}
