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

// An editorial feedback item the model reported with the editor's feedback tool, from `state`.
// `block_index` starts at 1; null is post-wide. Manual items have no quote or replacement.
export type FeedbackItem = {
	id: string;
	block_index: number | null;
	title: string;
	feedback: string;
	quote?: string;
	replacement?: string;
	requires_manual: boolean;
};
export type Feedback = { summary: string; items: FeedbackItem[] };
// What the user did with a proofreading issue or a feedback item, by kind and id.
export type FixStatus = 'applied' | 'dismissed';
export type FixStatuses = Record< FixKind, Record< string, FixStatus > >;

// The review pill's count: the proofreading issues and feedback items not yet applied or dismissed.
export const reviewCount = (
	status: FixStatuses,
	issues: { id: string }[],
	items: { id: string }[]
) =>
	issues.filter( ( issue ) => ! status.proofread[ issue.id ] ).length +
	items.filter( ( item ) => ! status.feedback[ item.id ] ).length;

// A review with no items but a summary: the reviewer found nothing to change, and says so.
export const isSummaryOnly = ( feedback: Feedback | null ) =>
	!! feedback && ! feedback.items.length && !! feedback.summary.trim();

// What Apply replaces: a proofreading issue or a feedback item.
export type FixKind = 'proofread' | 'feedback';
export type Fix = Pick< FeedbackItem, 'id' | 'block_index' | 'quote' | 'replacement' >;

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
	const text = normalized.map( ( { char } ) => char ).join( '' );
	const wanted = quote.replace( /\s+/g, ' ' ).trim();
	const index = wanted ? text.indexOf( wanted ) : -1;
	if ( index < 0 ) {
		return null;
	}
	return { first: normalized[ index ], last: normalized[ index + wanted.length - 1 ] };
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
export const htmlOf = ( value: unknown ) =>
	typeof value === 'string'
		? value
		: ( value as { toHTMLString?: () => string } | undefined )?.toHTMLString?.();

// How many characters of Apply's HTML on each side of its change Undo looks for.
const AROUND = 20;

// The HTML with the one change from `before` to `next` taken back, found by the text Apply left on
// each side of it, or null unless that's in the HTML exactly once.
function revertText( html: string, before: string, next: string ) {
	let start = 0;
	while ( start < before.length && start < next.length && before[ start ] === next[ start ] ) {
		start++;
	}
	let end = 0;
	while (
		end < before.length - start &&
		end < next.length - start &&
		before[ before.length - 1 - end ] === next[ next.length - 1 - end ]
	) {
		end++;
	}
	const from = Math.max( 0, start - AROUND );
	const to = Math.min( next.length, next.length - end + AROUND );
	const wanted = next.slice( from, to );
	const index = wanted ? html.indexOf( wanted ) : -1;
	if ( index < 0 || html.indexOf( wanted, index + 1 ) >= 0 ) {
		return null;
	}
	const changed = index + start - from;
	return (
		html.slice( 0, changed ) +
		before.slice( start, before.length - end ) +
		html.slice( changed + next.length - end - start )
	);
}

// What Undo puts in an attribute whose HTML is `html` now, after Apply replaced `before` with
// `next`: `before` when the text is as Apply left it; the HTML with only Apply's change taken back
// when that's still there with the same text around it, as after another Apply in the block; null
// when it isn't. Undefined when the text is already as it was, as after the editor's own undo.
export function undoValue( html: string, { before, next }: { before: unknown; next: string } ) {
	if ( html === next ) {
		return before;
	}
	const old = htmlOf( before );
	if ( html === old ) {
		return undefined;
	}
	return typeof old === 'string' ? revertText( html, old, next ) : null;
}

export type Target = { clientId: string; key: string; next: string };

// Where Apply would replace the quote: the block, or the first inner block that has it in one run
// of text, and the attribute's new value. Undefined when Apply can't.
function targetIn( block: BlockInstance, issue: Fix ): Target | undefined {
	for ( const key of RICH_TEXT_KEYS ) {
		const html = htmlOf( block.attributes[ key ] );
		const next =
			typeof html === 'string'
				? replaceText( html, issue.quote ?? '', issue.replacement ?? '' )
				: null;
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
// Null when the post had no such block, or the issue is post-wide.
export type Bindings = Map< string, { issue: Fix; clientId: string | null } >;

// The issue's own block. A new list binds an issue again only when its block is gone, replaced by
// a reload or a merge: its `block_index` can be from before the user's own new blocks. While the
// same feedback item's block is gone, it's the block at its `block_index`, found each time and not
// bound: feedback items keep their object while a rewrite or a transform gives the block a new
// clientId, and the editor's undo brings the bound block back. A proofreading issue comes as a new
// object after a change, so while its block is gone it has none.
export function boundBlock(
	bindings: Bindings,
	blocks: BlockInstance[],
	issue: Fix,
	kind: FixKind
) {
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
			clientId:
				issue.block_index === null ? null : ( blocks[ issue.block_index - 1 ]?.clientId ?? null ),
		} );
	}
	const { clientId } = bindings.get( issue.id )!;
	return (
		( clientId && blocks.find( ( item ) => item.clientId === clientId ) ) ||
		( kind === 'feedback' && issue.block_index !== null
			? blocks[ issue.block_index - 1 ]
			: undefined )
	);
}

// Where Apply would replace the quote, only in the issue's own block and its inner blocks.
export function locate( bindings: Bindings, blocks: BlockInstance[], issue: Fix, kind: FixKind ) {
	const block = boundBlock( bindings, blocks, issue, kind );
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
