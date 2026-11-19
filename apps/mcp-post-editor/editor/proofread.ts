import type { Block as BlockInstance } from '@wordpress/blocks';

// A proofreading issue the model reported with `wpcom-post-editor-proofread`, from `state`.
// `block_index` starts at 1; `quote` is exact text in that block.
export type ProofreadIssue = {
	id: string;
	block_index: number;
	quote: string;
	replacement: string;
	reason: string;
	kind: 'spelling' | 'grammar' | 'style' | 'clarity';
};

// The server compares quotes with a block's text normalised: <br> and block-level tags become
// a space, other tags go, entities are decoded, and whitespace (NBSP too) collapses and trims.
// Each normalised character keeps where it starts and ends in its source, to map a match back.
const BLOCK_TAGS = [
	'p',
	'li',
	'ul',
	'ol',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'div',
	'figcaption',
	'td',
	'th',
	'blockquote',
	'pre',
	'summary',
	'details',
];
const SPACE_TAG = new RegExp( `^<\\/?(?:br|${ BLOCK_TAGS.join( '|' ) })\\b`, 'i' );

type Char< T > = { char: string; start: T; end: T };

function collapse< T >( chars: Char< T >[] ) {
	const result: Char< T >[] = [];
	for ( const char of chars ) {
		const last = result[ result.length - 1 ];
		if ( ! /\s/.test( char.char ) ) {
			result.push( char );
		} else if ( last?.char === ' ' ) {
			last.end = char.end;
		} else if ( last ) {
			result.push( { ...char, char: ' ' } );
		}
	}
	if ( result[ result.length - 1 ]?.char === ' ' ) {
		result.pop();
	}
	return result;
}

// The first and last normalised characters of the quote's first match, or null.
function match< T >( chars: Char< T >[], quote: string ) {
	const normalized = collapse( chars );
	const wanted = quote.replace( /\s+/g, ' ' ).trim();
	const index = wanted
		? normalized
				.map( ( { char } ) => char )
				.join( '' )
				.indexOf( wanted )
		: -1;
	return index < 0
		? null
		: { first: normalized[ index ], last: normalized[ index + wanted.length - 1 ] };
}

type Position = { node: Node; offset: number };

// The range of the quote in the element's text, or null. Inner blocks' text isn't the element's.
export function findQuote( element: Element, quote: string ) {
	const chars: Char< Position >[] = [];
	const walk = ( parent: Node ) => {
		parent.childNodes.forEach( ( node ) => {
			if ( node.nodeType === Node.TEXT_NODE ) {
				const { data } = node as Text;
				for ( let offset = 0; offset < data.length; offset++ ) {
					chars.push( {
						char: data[ offset ],
						start: { node, offset },
						end: { node, offset: offset + 1 },
					} );
				}
				return;
			}
			if (
				node.nodeType !== Node.ELEMENT_NODE ||
				( node as Element ).matches( '[data-block], [data-rich-text-placeholder]' )
			) {
				return;
			}
			const name = ( node as Element ).localName;
			// Never a range's end: the quote is trimmed.
			const space = { char: ' ', start: { node, offset: 0 }, end: { node, offset: 0 } };
			if ( name === 'br' ) {
				chars.push( space );
			} else if ( BLOCK_TAGS.includes( name ) ) {
				chars.push( space );
				walk( node );
				chars.push( { ...space } );
			} else {
				walk( node );
			}
		} );
	};
	walk( element );
	const found = match( chars, quote );
	if ( ! found ) {
		return null;
	}
	const range = element.ownerDocument.createRange();
	range.setStart( found.first.start.node, found.first.start.offset );
	range.setEnd( found.last.end.node, found.last.end.offset );
	return range;
}

let decoder: HTMLTextAreaElement | undefined;
const decodeEntity = ( entity: string ) => {
	decoder ??= document.createElement( 'textarea' );
	decoder.innerHTML = entity;
	return decoder.value;
};

function htmlChars( html: string ) {
	const chars: Char< number >[] = [];
	for ( const token of html.matchAll( /<[^>]*>|&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);|[^]/gi ) ) {
		const [ source ] = token;
		const start = token.index;
		const end = start + source.length;
		if ( source.length > 1 && source[ 0 ] === '<' ) {
			if ( SPACE_TAG.test( source ) ) {
				chars.push( { char: ' ', start, end } );
			}
			continue;
		}
		const value = source.length > 1 ? decodeEntity( source ) : source;
		value.split( '' ).forEach( ( char ) => chars.push( { char, start, end } ) );
	}
	return chars;
}

// Rich text escapes only & and < in text.
const escapeText = ( text: string ) => text.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' );

// Replaces the quote's first match in the HTML, as the server normalises its text, or returns
// null if there's none or it crosses formatting (any tag but <br>). Only the quote's source
// changes; the replacement goes in as text, escaped.
export function replaceText( html: string, quote: string, replacement: string ) {
	const found = match( htmlChars( html ), quote );
	if ( ! found ) {
		return null;
	}
	const { start } = found.first;
	const { end } = found.last;
	if ( /<(?!br\b)[a-z/!]/i.test( html.slice( start, end ) ) ) {
		return null;
	}
	return html.slice( 0, start ) + escapeText( replacement ) + html.slice( end );
}

// Rich text attributes are strings or, in recent Gutenberg, RichTextData.
const RICH_TEXT_KEYS = [ 'content', 'caption' ];

export type Target = { clientId: string; key: string; next: string };

// Where Apply would replace the quote: the block, or the first inner block that has it in one run
// of text, and the attribute's new value. Undefined when Apply can't.
function targetIn( block: BlockInstance, issue: ProofreadIssue ): Target | undefined {
	for ( const key of RICH_TEXT_KEYS ) {
		const value = block.attributes[ key ] as string | { toHTMLString?: () => string };
		const html = typeof value === 'string' ? value : value?.toHTMLString?.();
		const next =
			typeof html === 'string' ? replaceText( html, issue.quote, issue.replacement ) : null;
		if ( next !== null ) {
			return { clientId: block.clientId, key, next };
		}
	}
	for ( const inner of block.innerBlocks ) {
		const target = targetIn( inner, issue );
		if ( target ) {
			return target;
		}
	}
	return undefined;
}

// The top-level block each issue was reported against, by issue id: the one at its `block_index`
// when it arrived. Bound by clientId, so blocks the user adds or removes above it don't move it.
// Null when the post had no such block.
export type Bindings = Map< string, { issue: ProofreadIssue; clientId: string | null } >;

// Where Apply would replace the quote, only in the issue's own block and its inner blocks. A new
// list binds an issue again only when its block is gone, replaced by a reload or a merge: its
// `block_index` can be from before the user's own new blocks.
export function locate( bindings: Bindings, blocks: BlockInstance[], issue: ProofreadIssue ) {
	const bound = bindings.get( issue.id );
	if ( bound && bound.issue !== issue ) {
		if ( blocks.some( ( block ) => block.clientId === bound.clientId ) ) {
			bound.issue = issue;
		} else {
			bindings.delete( issue.id );
		}
	}
	if ( ! bindings.has( issue.id ) ) {
		bindings.set( issue.id, {
			issue,
			clientId: blocks[ issue.block_index - 1 ]?.clientId ?? null,
		} );
	}
	const { clientId } = bindings.get( issue.id )!;
	const block = clientId && blocks.find( ( item ) => item.clientId === clientId );
	return block ? targetIn( block, issue ) : undefined;
}

// The rich text that shows the target's attribute, not an inner block's, so the underline is on
// the occurrence Apply replaces.
export function richTextOf( { clientId, key }: Target ) {
	const block = document.querySelector(
		`.editor-styles-wrapper [data-block="${ CSS.escape( clientId ) }"]`
	);
	const selector = `[data-wp-block-attribute-key="${ key }"]`;
	return (
		block &&
		[ block, ...block.querySelectorAll( selector ) ].find(
			( element ) => element.matches( selector ) && element.closest( '[data-block]' ) === block
		)
	);
}
