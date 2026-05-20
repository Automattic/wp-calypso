// Smart-walk paginator. Mounts each `.ela-page` off-screen, measures real
// overflow, and splits long content onto continuation pages so a long
// b-section never gets clipped by its grid cell. Ported from the prototype
// (services/paginate.ts).
//
// The pipeline:
//   1. trimOverflowingSmallBlocks — b-small can't paginate (its cell is
//      1-2 rows), so we drop trailing sentences until it fits. Better a
//      shorter caption than a mid-word clip.
//   2. popOverflowingParagraphs — long b-section paragraphs that overflow
//      get their trailing <p>s peeled onto a Pattern-B continuation page.
//      Single-paragraph blocks (Pattern H framing copy) peel one sentence
//      at a time.
//   3. popUntilFits — for everything else, pop trailing atomic groups
//      (block + its anchor headline) until the body fits.
//   4. Balance — if the continuation page reads sparse, pull one more
//      group back from the source so the trailing page doesn't feel
//      stranded.
//
// All measurement is browser-only (uses `document`). The hook layer
// only calls paginatePages once we're past the LLM round-trip.

import { ELA_PAGE_HEIGHT, ELA_PAGE_WIDTH } from './types';

const OVERFLOW_TOLERANCE = 1;
// Per-source-page recursion bound. Pagination should converge in a handful
// of continuations even for very long text; this is just a runaway guard
// so we don't loop forever on a single paragraph taller than the page.
const MAX_RECURSION_PER_PAGE = 64;

/**
 * Splits each input page into one or more rendered pages based on
 * real-DOM overflow measurement. Continuation pages inherit the source
 * page's footer and renumber sequentially.
 * @param pages - The HTML strings for each LLM-emitted page.
 * @returns The expanded page list, renumbered.
 */
export async function paginatePages( pages: string[] ): Promise< string[] > {
	if ( pages.length === 0 ) {
		return pages;
	}
	if ( typeof document === 'undefined' ) {
		return pages;
	}
	const out: string[] = [];
	for ( const html of pages ) {
		const split = await splitOnePage( html, MAX_RECURSION_PER_PAGE );
		out.push( ...split );
	}
	// Renumber the footer page-number sequentially. The LLM writes "1",
	// "2"... into the footer, but pagination + continuation can leave
	// duplicates; authoritative numbering is "rendered page index + 1".
	return out.map( ( html, i ) => renumberFooter( html, i + 1 ) );
}

function renumberFooter( html: string, pageNumber: number ): string {
	return html.replace(
		/(<footer\b[^>]*class="[^"]*page-footer[^"]*"[^>]*>[\s\S]*<span[^>]*>)([^<]*)(<\/span>\s*<\/footer>)/i,
		( _match, head: string, _last: string, tail: string ) => `${ head }${ pageNumber }${ tail }`
	);
}

async function splitOnePage( html: string, budget: number ): Promise< string[] > {
	if ( budget <= 0 ) {
		return [];
	}
	const wrapper = mount( html );
	try {
		const pageEl = wrapper.querySelector< HTMLElement >( '.ela-page' );
		if ( ! pageEl ) {
			return [ html ];
		}
		const body = pageEl.querySelector< HTMLElement >( '.page-body' );
		if ( ! body ) {
			return [ pageEl.outerHTML ];
		}

		const headerHtml = pageEl.querySelector( '.page-header' )?.outerHTML ?? '';
		const footerHtml = pageEl.querySelector( '.page-footer' )?.outerHTML ?? '';
		const styleHtml =
			Array.from( pageEl.children ).find( ( c ) => c.tagName === 'STYLE' )?.outerHTML ?? '';
		// Continuation pages inherit body-role grid (12-col, top-aligned)
		// so spillover flows correctly regardless of the source page role.
		const continuationRole = 'body';

		// FIRST: trim b-small (side-note) blocks. They have no
		// continuation — drop trailing sentences until the text fits.
		trimOverflowingSmallBlocks( body );

		// SECOND: handle b-section text-level overflow. Pop trailing <p>s
		// (or peel sentences from a single-paragraph block) onto a
		// Pattern-B continuation.
		const overflowParagraphs = popOverflowingParagraphs( body );
		if ( overflowParagraphs.length > 0 ) {
			const mainHtml = pageEl.outerHTML;
			const continuationHtml = buildParagraphContinuation(
				styleHtml,
				headerHtml,
				footerHtml,
				overflowParagraphs,
				continuationRole
			);
			if ( budget <= 1 ) {
				return [ mainHtml, continuationHtml ];
			}
			const tail = await splitOnePage( continuationHtml, budget - 1 );
			return [ mainHtml, ...tail ];
		}

		if ( ! isOverflowing( body ) ) {
			return [ pageEl.outerHTML ];
		}

		const popped = popUntilFits( body );
		if ( popped.length === 0 ) {
			// Single child taller than the body — last-resort shrink.
			shrinkOversizedChild( body );
			return [ pageEl.outerHTML ];
		}

		// BALANCE: never orphan a sparse continuation. If continuation has
		// fewer than 3 block groups OR would fill less than ~65% of the
		// body height, pull one more group back from the source.
		const bodyClientHeight = body.clientHeight;
		const minContinuationFill = bodyClientHeight * 0.65;
		const measureHeight = ( els: HTMLElement[] ): number =>
			els.reduce( ( h, el ) => h + cachedHeight( el ), 0 );

		let safety = 8;
		while (
			safety-- > 0 &&
			body.children.length > 1 &&
			( popped.length < 3 || measureHeight( popped ) < minContinuationFill )
		) {
			const extra = popOneAtomicGroup( body );
			if ( extra.length === 0 ) {
				break;
			}
			popped.unshift( ...extra );
		}

		const mainHtml = pageEl.outerHTML;
		const continuationHtml = buildContinuation(
			styleHtml,
			headerHtml,
			footerHtml,
			popped,
			continuationRole
		);
		if ( budget <= 1 ) {
			return [ mainHtml, continuationHtml ];
		}
		const tail = await splitOnePage( continuationHtml, budget - 1 );
		return [ mainHtml, ...tail ];
	} finally {
		wrapper.remove();
	}
}

function mount( html: string ): HTMLElement {
	const wrapper = document.createElement( 'div' );
	wrapper.style.position = 'fixed';
	wrapper.style.top = '0';
	wrapper.style.left = '0';
	wrapper.style.width = `${ ELA_PAGE_WIDTH }px`;
	wrapper.style.height = `${ ELA_PAGE_HEIGHT }px`;
	wrapper.style.overflow = 'hidden';
	wrapper.style.opacity = '0';
	wrapper.style.pointerEvents = 'none';
	wrapper.style.zIndex = '-1';
	wrapper.innerHTML = html;
	document.body.appendChild( wrapper );
	return wrapper;
}

function isOverflowing( el: HTMLElement ): boolean {
	return el.scrollHeight > el.clientHeight + OVERFLOW_TOLERANCE;
}

function popUntilFits( row: HTMLElement ): HTMLElement[] {
	const popped: HTMLElement[] = [];
	let safety = 50;
	while ( isOverflowing( row ) && row.children.length > 1 && safety-- > 0 ) {
		const group = popOneAtomicGroup( row );
		if ( group.length === 0 ) {
			break;
		}
		popped.unshift( ...group );
	}
	return popped;
}

function popOneAtomicGroup( row: HTMLElement ): HTMLElement[] {
	const kids = Array.from( row.children ).filter(
		( n ): n is HTMLElement => n instanceof HTMLElement && n.tagName !== 'STYLE'
	);
	if ( kids.length === 0 ) {
		return [];
	}
	const last = kids[ kids.length - 1 ];
	const prev = kids[ kids.length - 2 ];
	const group: HTMLElement[] = [ last ];
	if ( prev && isHeaderLike( prev ) ) {
		group.unshift( prev );
	}
	// Cache rendered height BEFORE detaching — detached elements report
	// 0 from getBoundingClientRect.
	group.forEach( ( el ) => {
		el.dataset.cachedHeight = String( el.getBoundingClientRect().height );
		row.removeChild( el );
	} );
	return group;
}

function cachedHeight( el: HTMLElement ): number {
	const v = parseFloat( el.dataset.cachedHeight ?? '0' );
	return Number.isFinite( v ) ? v : 0;
}

function isHeaderLike( el: HTMLElement ): boolean {
	if ( el.classList?.contains( 'b-headline' ) ) {
		return true;
	}
	if ( el.classList?.contains( 'b-display' ) ) {
		return true;
	}
	if ( el.classList?.contains( 'b-quote' ) ) {
		return true;
	}
	const tag = el.tagName;
	if ( tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4' ) {
		return true;
	}
	return false;
}

function shrinkOversizedChild( row: HTMLElement ): void {
	const kids = Array.from( row.children ).filter(
		( n ): n is HTMLElement => n instanceof HTMLElement && n.tagName !== 'STYLE'
	);
	if ( kids.length !== 1 ) {
		return;
	}
	const child = kids[ 0 ];
	const baseSize = parseFloat( getComputedStyle( child ).fontSize );
	if ( ! Number.isFinite( baseSize ) ) {
		return;
	}
	let factor = 1;
	let safety = 10;
	while ( isOverflowing( row ) && factor > 0.7 && safety-- > 0 ) {
		factor *= 0.95;
		child.style.fontSize = `${ baseSize * factor }px`;
	}
}

// Side-note blocks (b-small) are deliberately small — their text must fit
// completely or it gets clipped mid-sentence. Drop trailing sentences
// until the rendered text fits the block's module height. If trimming
// reduces the block to nothing, remove the block entirely.
function trimOverflowingSmallBlocks( body: HTMLElement ): void {
	// Skip b-small inside a b-container — Pattern H content is composed,
	// not flowed; trimming would silently rewrite the callout's framing.
	const blocks = Array.from( body.querySelectorAll< HTMLElement >( '.b-small' ) ).filter(
		( el ) => ! el.closest( '.b-container' )
	);
	for ( const block of blocks ) {
		const ps = Array.from( block.querySelectorAll< HTMLElement >( ':scope > p' ) );
		if ( ps.length === 0 ) {
			continue;
		}
		let safety = 200;
		while ( block.scrollHeight > block.clientHeight + OVERFLOW_TOLERANCE && safety-- > 0 ) {
			const lastP = block.querySelector< HTMLElement >( ':scope > p:last-of-type' );
			if ( ! lastP ) {
				break;
			}
			const text = lastP.textContent ?? '';
			const trimmed = trimToLastSentence( text );
			if ( trimmed === text ) {
				lastP.remove();
				if ( block.querySelectorAll( ':scope > p' ).length === 0 ) {
					break;
				}
				continue;
			}
			lastP.textContent = trimmed;
			if ( trimmed === '' ) {
				lastP.remove();
			}
		}
		if ( ! block.textContent?.trim() ) {
			block.remove();
		}
	}
}

// Trim back to the last full sentence ending (., !, ?) before the end.
// If the input ends in a sentence boundary, trim ONE sentence. If no
// boundary exists, return the input unchanged so the caller can decide.
function trimToLastSentence( text: string ): string {
	const t = text.trim();
	if ( ! t ) {
		return '';
	}
	const endIdx = /[.!?]\s*$/.test( t ) ? t.replace( /[.!?]\s*$/, '' ).length : t.length;
	const slice = t.slice( 0, endIdx );
	const m = slice.match( /[.!?](?=[^.!?]*$)/ );
	if ( ! m || m.index === undefined ) {
		return t;
	}
	return slice.slice( 0, m.index + 1 ).trim();
}

// Walk text blocks; if rendered content exceeds the cell, pop trailing
// <p>s into an overflow list until it fits. Returns the popped <p>
// outerHTML strings in document order, ready for the continuation page.
function popOverflowingParagraphs( body: HTMLElement ): string[] {
	const overflow: string[] = [];
	const blocks = Array.from(
		body.querySelectorAll< HTMLElement >( '.b-section, .b-small' )
	).filter( ( el ) => ! el.closest( '.b-container' ) );
	for ( const block of blocks ) {
		let safety = 100;
		while ( block.scrollHeight > block.clientHeight + OVERFLOW_TOLERANCE && safety-- > 0 ) {
			const ps = Array.from( block.querySelectorAll< HTMLElement >( ':scope > p' ) );
			if ( ps.length === 0 ) {
				break;
			}
			if ( ps.length === 1 ) {
				// Single-paragraph block: walk back from the end, popping
				// ONE sentence at a time into a tail accumulator until the
				// block fits. Tail becomes one <p> on the continuation so
				// the read stays in document order.
				const tail = peelTailSentences( block, ps[ 0 ] );
				if ( tail ) {
					overflow.unshift( `<p>${ escapeHtmlText( tail ) }</p>` );
				}
				break;
			}
			const last = ps[ ps.length - 1 ];
			overflow.unshift( last.outerHTML );
			last.remove();
		}
	}
	return overflow;
}

// Trim the trailing end of a single <p> until its enclosing block stops
// overflowing. Returns the popped sentences joined back into one string,
// in original order. Mutates lastP.textContent.
function peelTailSentences( block: HTMLElement, lastP: HTMLElement ): string {
	let tail = '';
	let safety = 100;
	while ( block.scrollHeight > block.clientHeight + OVERFLOW_TOLERANCE && safety-- > 0 ) {
		const text = lastP.textContent ?? '';
		const t = text.replace( /\s+$/, '' );
		if ( ! t ) {
			break;
		}
		const endIdx = /[.!?]$/.test( t ) ? t.length - 1 : t.length;
		const slice = t.slice( 0, endIdx );
		const m = slice.match( /[.!?](?=[^.!?]*$)/ );
		if ( ! m || m.index === undefined ) {
			break;
		}
		const splitIdx = m.index + 1;
		const head = slice.slice( 0, splitIdx ).trim();
		const piece = t.slice( splitIdx ).trim();
		if ( ! piece ) {
			break;
		}
		lastP.textContent = head;
		tail = piece + ( tail ? ' ' + tail : '' );
	}
	return tail;
}

function escapeHtmlText( s: string ): string {
	return s.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function buildParagraphContinuation(
	styleHtml: string,
	headerHtml: string,
	footerHtml: string,
	paragraphHtmls: string[],
	role: string
): string {
	// Pattern-B body block: full-page b-section, cols 2-5, rowspan 12.
	const sectionHtml = `<section class="b-section" data-span="4" data-rowspan="12" style="grid-column: 2 / -1;">${ paragraphHtmls.join(
		'\n'
	) }</section>`;
	return `<div class="ela-page" data-role="${ role }">${ styleHtml }${ headerHtml }<main class="page-body">${ sectionHtml }</main>${ footerHtml }</div>`;
}

function buildContinuation(
	styleHtml: string,
	headerHtml: string,
	footerHtml: string,
	bodyChildren: HTMLElement[],
	role: string
): string {
	bodyChildren.forEach( ( el ) => {
		delete el.dataset.cachedHeight;
	} );
	const bodyHtml = bodyChildren.map( ( el ) => el.outerHTML ).join( '\n' );
	return `<div class="ela-page" data-role="${ role }">${ styleHtml }${ headerHtml }<main class="page-body">${ bodyHtml }</main>${ footerHtml }</div>`;
}
