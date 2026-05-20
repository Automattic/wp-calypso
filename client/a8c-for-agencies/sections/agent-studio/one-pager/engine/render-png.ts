import { toPng } from 'html-to-image';
import { ELA_PAGE_HEIGHT, ELA_PAGE_WIDTH } from './types';

const TRANSPARENT_1X1 =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

function isRenderThrottled(): boolean {
	return typeof document !== 'undefined' && document.visibilityState !== 'visible';
}

function waitForForeground(): Promise< void > {
	if ( ! isRenderThrottled() ) {
		return Promise.resolve();
	}
	return new Promise( ( resolve ) => {
		const check = () => {
			if ( isRenderThrottled() ) {
				return;
			}
			document.removeEventListener( 'visibilitychange', check );
			window.removeEventListener( 'focus', check );
			requestAnimationFrame( () => resolve() );
		};
		document.addEventListener( 'visibilitychange', check );
		window.addEventListener( 'focus', check );
	} );
}

function rafTwice(): Promise< void > {
	return new Promise( ( resolve ) =>
		requestAnimationFrame( () => requestAnimationFrame( () => resolve() ) )
	);
}

async function waitForImages( container: HTMLElement ): Promise< void > {
	const images = Array.from( container.querySelectorAll( 'img' ) );
	await Promise.all(
		images.map( ( img ) => {
			if ( img.complete && img.naturalWidth > 0 ) {
				return Promise.resolve();
			}
			return new Promise< void >( ( resolve ) => {
				img.addEventListener( 'load', () => resolve(), { once: true } );
				img.addEventListener( 'error', () => resolve(), { once: true } );
			} );
		} )
	);
}

// Pages persist their BASE_CSS inline, so older outputs still carry
// `grid-template-rows: repeat(12, 1fr)` — and a bare `1fr` is
// `minmax(auto, 1fr)`, whose `auto` minimum lets a row stretch past its
// share to fit an oversized (not-yet-fitted) headline. When that happens
// the fitter measures `clientHeight` as "already fits" and never shrinks,
// so the headline blows out of its cell and over the block above.
// Re-asserting minmax(0, 1fr) with `important` restores fixed tracks
// before any measurement runs.
function enforceFixedGrid( root: HTMLElement ): void {
	const bodies = root.querySelectorAll< HTMLElement >( '.ela-page > .page-body' );
	for ( const body of Array.from( bodies ) ) {
		body.style.setProperty( 'grid-template-columns', 'repeat(5, minmax(0, 1fr))', 'important' );
		body.style.setProperty( 'grid-template-rows', 'repeat(12, minmax(0, 1fr))', 'important' );
		body.style.setProperty( 'grid-auto-rows', 'minmax(0, 1fr)', 'important' );
	}
}

function hasDirectText( el: HTMLElement ): boolean {
	for ( const node of Array.from( el.childNodes ) ) {
		if ( node.nodeType === Node.TEXT_NODE && ( node.nodeValue ?? '' ).trim().length > 0 ) {
			return true;
		}
	}
	return false;
}

// Connector words that read as orphaned when they end up alone or near-alone
// on a line. Keep in sync with Bea — both renderers use the same penalty.
const CONNECTOR_WORDS = new Set( [
	'and',
	'or',
	'but',
	'for',
	'to',
	'of',
	'in',
	'on',
	'with',
	'from',
	'by',
	'at',
] );

// Walk text nodes under `node` and emit a fragment per non-whitespace run,
// capturing its actual rendered top edge. Used by estimateHeadlineLines to
// reconstruct what the browser broke onto each line — measurement, not guess.
function collectTextFragments(
	node: ChildNode,
	range: Range,
	fragments: Array< { top: number; text: string } >
): void {
	if ( node.nodeType === Node.TEXT_NODE ) {
		const text = node.textContent ?? '';
		for ( const match of text.matchAll( /\S+/g ) ) {
			const start = match.index ?? 0;
			range.setStart( node, start );
			range.setEnd( node, start + match[ 0 ].length );
			const rect = range.getBoundingClientRect();
			if ( rect.width > 0 && rect.height > 0 ) {
				fragments.push( { top: rect.top, text: match[ 0 ] } );
			}
		}
		return;
	}
	node.childNodes.forEach( ( child ) => collectTextFragments( child, range, fragments ) );
}

// Reconstruct the rendered lines of `el` by measuring each word's bounding
// rect with a Range and grouping words that share a top edge. Tolerates
// 2px of jitter from font hinting differences across word baselines.
function estimateHeadlineLines( el: HTMLElement ): Array< { top: number; text: string } > {
	const range = el.ownerDocument.createRange();
	const fragments: Array< { top: number; text: string } > = [];
	collectTextFragments( el, range, fragments );
	range.detach();

	const grouped: Array< { top: number; parts: string[] } > = [];
	for ( const fragment of fragments ) {
		const group = grouped.find( ( item ) => Math.abs( item.top - fragment.top ) < 2 );
		if ( group ) {
			group.parts.push( fragment.text );
		} else {
			grouped.push( { top: fragment.top, parts: [ fragment.text ] } );
		}
	}

	return grouped
		.sort( ( a, b ) => a.top - b.top )
		.map( ( line ) => ( {
			top: line.top,
			text: line.parts.join( ' ' ).replace( /\s+/g, ' ' ).trim(),
		} ) )
		.filter( ( line ) => line.text.length > 0 );
}

// Score a headline candidate — lower is better. Penalises shrink, uneven
// line lengths, single-word last lines (widows), connector-only lines, and
// connector-trailing breaks. Mirrors the prototype's typography heuristic.
function scoreHeadlineCandidate( text: HTMLElement, ratio: number ): number {
	const content = ( text.textContent ?? '' ).trim().replace( /\s+/g, ' ' );
	const words = content.split( /\s+/ ).filter( Boolean );
	const lines = estimateHeadlineLines( text );
	if ( words.length < 4 || lines.length < 2 ) {
		return ( 1 - ratio ) * 80;
	}

	const lineLengths = lines.map( ( line ) => line.text.length );
	const averageChars =
		lineLengths.reduce( ( sum, length ) => sum + length, 0 ) / lineLengths.length;
	const averageWords = words.length / lines.length;
	const last = lines[ lines.length - 1 ];
	const lastWords = last.text.split( /\s+/ ).filter( Boolean );
	const shrinkPenalty = ( 1 - ratio ) * ( words.length >= 10 ? 28 : 68 );
	let targetAverageWords = 1.8;
	if ( words.length >= 14 ) {
		targetAverageWords = 3;
	} else if ( words.length >= 10 ) {
		targetAverageWords = 2.5;
	}
	const avgWordsPenalty = Math.max( 0, targetAverageWords - averageWords ) * 16;
	const lineCountPenalty = lines.length * ( words.length >= 10 ? 2.2 : 0.8 );
	const raggedness =
		lineLengths.reduce( ( sum, length ) => sum + Math.abs( length - averageChars ), 0 ) /
		lines.length;

	let score =
		shrinkPenalty +
		avgWordsPenalty +
		lineCountPenalty +
		( raggedness / Math.max( 1, averageChars ) ) * 10;
	if ( lastWords.length === 1 ) {
		score += words.length >= 8 ? 140 : 90;
	}
	if ( last.text.length < averageChars * 0.5 ) {
		score += ( averageChars * 0.5 - last.text.length ) * 2;
	}

	lines.forEach( ( line, idx ) => {
		const lineWords = line.text.toLowerCase().split( /\s+/ ).filter( Boolean );
		if ( ! lineWords.length ) {
			return;
		}
		if ( lineWords.length === 1 && CONNECTOR_WORDS.has( lineWords[ 0 ] ) ) {
			score += 180;
		}
		if ( idx < lines.length - 1 && CONNECTOR_WORDS.has( lineWords[ lineWords.length - 1 ] ) ) {
			score += 80;
		}
		if (
			idx === lines.length - 1 &&
			lineWords.length <= 2 &&
			CONNECTOR_WORDS.has( lineWords[ 0 ] )
		) {
			score += 22;
		}
	} );

	return score;
}

// Font-size candidates from `original` down to `floor`, in 4% steps. Step
// chosen empirically — finer steps spend layout time without changing the
// chosen size; coarser steps skip the sweet spot.
function candidateFontSizes( original: number, floor: number ): number[] {
	const sizes: number[] = [];
	for (
		let ratio = 1;
		ratio >= floor / original;
		ratio = Math.round( ( ratio - 0.04 ) * 100 ) / 100
	) {
		sizes.push( original * ratio );
	}
	if ( sizes[ sizes.length - 1 ] !== floor ) {
		sizes.push( floor );
	}
	return sizes;
}

// Fit a cover title (.b-display or .b-headline on a cover page) into its
// grid cell using the measured-line algorithm.
//
//   1) Build candidate font-sizes from base down to a balance floor.
//   2) For each candidate, measure the real browser line breaks and score
//      the result — hard overflow, raggedness, single-word widows,
//      connector-only lines. Lower score wins, so a slightly smaller
//      size that breaks cleanly beats a larger one that strands a word.
//   3) If the balanced pick still overflows, shrink continuously to a
//      hard floor (covers stay loud, so the floor is high).
//   4) If it STILL overflows, transform-scale the text as a final safety
//      valve so a stubborn title is never clipped by the cell below it.
//
// The title text is wrapped in a `.ela-fit-text` span so step 4 can scale
// the text without disturbing the flex cell anchoring it to the row band.
function fitCoverTitle( el: HTMLElement ): void {
	const doc = el.ownerDocument;
	let text = el.querySelector< HTMLElement >( ':scope > .ela-fit-text' );
	if ( ! text ) {
		text = doc.createElement( 'span' );
		text.className = 'ela-fit-text';
		text.style.display = 'block';
		text.style.width = '100%';
		while ( el.firstChild ) {
			text.appendChild( el.firstChild );
		}
		el.appendChild( text );
	}
	// Bottom-aligned titles grow upward, top-aligned ones downward — scale
	// from the anchored edge so the safety valve doesn't drift the text off
	// its edge.
	text.style.transformOrigin = el.dataset.align === 'bottom' ? 'bottom left' : 'top left';
	text.style.transform = 'scale(1)';

	// Idempotent re-entry: clear any prior fit so `original` reads the CSS
	// base, not an already shrunk size. Lets the title be re-fitted safely
	// after a brand font finishes loading without compounding the shrink.
	el.style.removeProperty( 'font-size' );
	el.style.removeProperty( 'line-height' );

	const original = parseFloat( getComputedStyle( el ).fontSize );
	const baseLh = parseFloat( getComputedStyle( el ).lineHeight );
	if ( ! Number.isFinite( original ) || original <= 0 ) {
		return;
	}
	const lhRatio = Number.isFinite( baseLh ) && baseLh > 0 ? baseLh / original : 1;

	const isDisplay = el.classList.contains( 'b-display' );
	// Covers are the hero moment — keep the type loud. The font-size floor
	// is high; the transform safety valve covers anything below it.
	const hardFloor = Math.max( isDisplay ? 40 : 24, original * 0.5 );
	const balanceFloor = Math.max( hardFloor, original * 0.66 );

	const apply = ( size: number ): void => {
		el.style.fontSize = `${ size }px`;
		el.style.lineHeight = `${ size * lhRatio }px`;
	};
	const overflowOf = () => ( {
		x: Math.max( 0, ( text as HTMLElement ).scrollWidth - el.clientWidth ),
		y: Math.max( 0, ( text as HTMLElement ).scrollHeight - el.clientHeight ),
	} );

	const sizes = candidateFontSizes( original, balanceFloor );
	let best: { size: number; score: number } | undefined;
	for ( const size of sizes ) {
		apply( size );
		text.style.transform = 'scale(1)';
		const overflow = overflowOf();
		const ratio = size / original;
		const score = scoreHeadlineCandidate( text, ratio ) + ( overflow.x + overflow.y ) * 1000;
		if ( ! best || score < best.score ) {
			best = { size, score };
		}
	}
	if ( ! best ) {
		return;
	}
	apply( best.size );
	text.style.transform = 'scale(1)';

	// The balanced pick may still overflow (very long title in a small cell).
	// Shrink continuously down to the hard floor before resorting to scaling.
	let overflow = overflowOf();
	if ( ( overflow.x > 0 || overflow.y > 0 ) && best.size > hardFloor ) {
		for ( let size = best.size * 0.96; size >= hardFloor; size *= 0.96 ) {
			apply( size );
			overflow = overflowOf();
			if ( overflow.x <= 0 && overflow.y <= 0 ) {
				return;
			}
		}
		apply( hardFloor );
	}

	overflow = overflowOf();
	if ( overflow.x <= 0 && overflow.y <= 0 ) {
		return;
	}

	// Final safety valve: scale the text down so it can never clip into the
	// block below. Font-size shrinking above handles reflow; this only mops up.
	for ( let scale = 0.97; scale >= 0.4; scale = Math.round( ( scale - 0.03 ) * 100 ) / 100 ) {
		text.style.transform = `scale(${ scale })`;
		if (
			text.scrollWidth * scale <= el.clientWidth + 1 &&
			text.scrollHeight * scale <= el.clientHeight + 1
		) {
			break;
		}
	}
}

/**
 * Fit every cover title under `root`, returning the elements touched so the
 * body-headline pass can exclude them. Safe to call more than once per
 * render — `fitCoverTitle` is idempotent — which the post-font-load re-fit
 * relies on.
 * @param root - Element containing one or more `.ela-page[data-role="cover"]`.
 * @returns The cover-title elements that were fitted.
 */
export function fitCoverTitlesIn( root: HTMLElement ): HTMLElement[] {
	const coverTitles = Array.from(
		root.querySelectorAll< HTMLElement >(
			'.ela-page[data-role="cover"] .b-display, .ela-page[data-role="cover"] .b-headline'
		)
	);
	for ( const el of coverTitles ) {
		fitCoverTitle( el );
	}
	return coverTitles;
}

// Body-page headlines / displays / quotes. Cover titles route to
// fitCoverTitle first and are excluded from this pass.
//
//   1) For .b-headline, walk the brand-role ramp via data-level. Each step
//      is a meaningful design move (different font / case / tracking, not
//      just a size shrink), so we prefer it whenever it can land the
//      headline inside the cell. Ramp: 0 → 1 → 2 → 3 → 4.
//   2) If the ramp can't fit (or for display / quote), binary-search for the
//      largest font-size in [minSize, baseSize] that fits the cell with
//      natural multi-line wrapping. Beats linear shrinking — linear could
//      blow past the "fits at 3 lines" sweet spot.
function fitHeadlinesToCell( root: HTMLElement ): void {
	enforceFixedGrid( root );
	const coverSet = new Set< HTMLElement >( fitCoverTitlesIn( root ) );

	const headlines = Array.from(
		root.querySelectorAll< HTMLElement >( '.b-headline, .b-display, .b-quote' )
	).filter( ( el ) => ! coverSet.has( el ) );
	const RAMP = [ '0', '1', '2', '3', '4' ] as const;
	for ( const el of headlines ) {
		const isDisplay = el.classList.contains( 'b-display' );
		const isQuote = el.classList.contains( 'b-quote' );
		const originalOverflow = el.style.overflow;
		el.style.overflow = 'hidden';
		try {
			if ( ! isDisplay && ! isQuote ) {
				let safety = RAMP.length;
				while ( el.scrollHeight > el.clientHeight + 1 && safety-- > 0 ) {
					const current = el.dataset.level ?? '2';
					const idx = RAMP.indexOf( current as ( typeof RAMP )[ number ] );
					if ( idx < 0 || idx >= RAMP.length - 1 ) {
						break;
					}
					el.dataset.level = RAMP[ idx + 1 ];
				}
			}
			if ( el.scrollHeight > el.clientHeight + 1 ) {
				const scaleTarget = isQuote ? el.querySelector< HTMLElement >( 'blockquote' ) ?? el : el;
				const baseSize = parseFloat( getComputedStyle( scaleTarget ).fontSize );
				const baseLh = parseFloat( getComputedStyle( scaleTarget ).lineHeight );
				const lhRatio = Number.isFinite( baseLh ) && baseLh > 0 ? baseLh / baseSize : 1.0;
				let minSize = 14;
				if ( isDisplay ) {
					minSize = 28;
				} else if ( isQuote ) {
					minSize = 18;
				}
				let lo = minSize;
				let hi = baseSize;
				const apply = ( size: number ): void => {
					scaleTarget.style.fontSize = `${ size }px`;
					scaleTarget.style.lineHeight = `${ size * lhRatio }px`;
				};
				const fits = ( size: number ): boolean => {
					apply( size );
					return el.scrollHeight <= el.clientHeight + 1;
				};
				if ( fits( minSize ) ) {
					while ( hi - lo > 0.5 ) {
						const mid = ( lo + hi ) / 2;
						if ( fits( mid ) ) {
							lo = mid;
						} else {
							hi = mid;
						}
					}
					apply( lo );
				}
			}
		} finally {
			el.style.overflow = originalOverflow;
		}
	}
}

function fitTablesToCell( root: HTMLElement ): void {
	const tables = Array.from( root.querySelectorAll< HTMLTableElement >( '.b-table > table' ) );
	for ( const table of tables ) {
		const block = table.closest< HTMLElement >( '.b-table' );
		if ( ! block ) {
			continue;
		}
		const baseSize = parseFloat( getComputedStyle( table ).fontSize );
		if ( ! Number.isFinite( baseSize ) ) {
			continue;
		}
		let factor = 1;
		let safety = 10;
		while ( table.scrollHeight > block.clientHeight + 1 && factor > 0.7 && safety-- > 0 ) {
			factor *= 0.94;
			table.style.fontSize = `${ baseSize * factor }px`;
		}
	}
}

// Walk every element under the page wrapper. If its content is wider than
// its box (horizontal clipping), reduce font-size in 5% steps until it fits,
// down to 40% of the original. Catches two failure modes:
//   - long headline that doesn't fit its grid column,
//   - .b-number / .b-stat figures whose flex parent gives them a
//     content-sized width, so clientWidth == scrollWidth even when the
//     rendered text overflows the actual grid track. Detect that case by
//     also measuring against the nearest grid-positioned ancestor.
function shrinkHorizontalOverflows( root: HTMLElement ): void {
	const all = Array.from( root.querySelectorAll< HTMLElement >( '*' ) );
	for ( const el of all ) {
		if ( ! hasDirectText( el ) ) {
			continue;
		}
		const baseSize = parseFloat( getComputedStyle( el ).fontSize );
		if ( ! Number.isFinite( baseSize ) || baseSize < 8 ) {
			continue;
		}
		const fits = (): boolean => {
			// Native overflow check: content wider than the element's own box.
			if ( el.scrollWidth > el.clientWidth + 1 ) {
				return false;
			}
			// Block-level shrunk-to-content elements (flex column children
			// with align-items:flex-start) report scrollWidth == clientWidth
			// even when their natural content exceeds the parent grid track.
			// Walk up to the grid track owner and compare actual rendered
			// width against the inner track width.
			const track = el.closest( '[data-span]' ) as HTMLElement | null;
			if ( track && track !== el ) {
				const trackStyle = getComputedStyle( track );
				const padX =
					parseFloat( trackStyle.paddingLeft || '0' ) +
					parseFloat( trackStyle.paddingRight || '0' );
				const inner = track.clientWidth - padX;
				if ( el.getBoundingClientRect().width > inner + 1 ) {
					return false;
				}
			}
			return true;
		};
		let factor = 1;
		let safety = 18;
		while ( ! fits() && factor > 0.4 && safety-- > 0 ) {
			factor *= 0.95;
			el.style.fontSize = `${ baseSize * factor }px`;
		}
	}
}

/**
 * Rasterizes a single page HTML string to a PNG data URL. Mounts the page
 * off-screen, waits for fonts and images, runs the full fit pipeline
 * (cover titles via measured-line scoring, body headlines via ramp +
 * binary search, tables, horizontal overflow), then snaps via
 * html-to-image at 2× pixel ratio.
 *
 * After the initial pass we wait once more for document.fonts.ready and
 * re-run `fitCoverTitlesIn` — a brand font can finish loading after the
 * first measurement and reflow the cover title taller than the cell.
 * `fitCoverTitle` is idempotent so this can't compound the shrink.
 * @param html - The page HTML (a `<div class="ela-page">` shell).
 * @returns A PNG data URL, or a transparent 1×1 when rendering fails.
 */
export async function renderElaPng( html: string ): Promise< string > {
	if ( typeof document === 'undefined' ) {
		return TRANSPARENT_1X1;
	}

	const wrapper = document.createElement( 'div' );
	wrapper.style.cssText =
		'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;pointer-events:none;z-index:-1';
	const container = document.createElement( 'div' );
	container.style.cssText = `width:${ ELA_PAGE_WIDTH }px;height:${ ELA_PAGE_HEIGHT }px;opacity:0`;
	container.innerHTML = html;
	wrapper.appendChild( container );
	document.body.appendChild( wrapper );

	try {
		await waitForForeground();
		await rafTwice();
		if ( document.fonts?.ready ) {
			try {
				await document.fonts.ready;
			} catch {
				// Best effort.
			}
		}
		await waitForImages( container );
		fitHeadlinesToCell( container );
		fitTablesToCell( container );
		shrinkHorizontalOverflows( container );

		// Re-fit cover titles once fonts have definitely settled. A late
		// pack-font swap reflows the headline and can re-clip it in a tight
		// cell. fitCoverTitle is idempotent so this never compounds the
		// shrink.
		if ( document.fonts?.ready ) {
			try {
				await document.fonts.ready;
			} catch {
				// Best effort.
			}
		}
		await rafTwice();
		fitCoverTitlesIn( container );

		container.style.opacity = '1';
		await rafTwice();

		try {
			const dataUrl = await toPng( container, {
				width: ELA_PAGE_WIDTH,
				height: ELA_PAGE_HEIGHT,
				pixelRatio: 2,
				cacheBust: false,
				imagePlaceholder: TRANSPARENT_1X1,
				skipFonts: true,
			} );
			return dataUrl || TRANSPARENT_1X1;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[one-pager render-png] toPng failed:', error );
			return TRANSPARENT_1X1;
		}
	} finally {
		wrapper.remove();
	}
}

/**
 * Runs the fit pipeline on a live, mounted container so the on-screen
 * preview matches the exported PNG. Without this, covers rendered raw in
 * the preview and clipped their titles. Includes the post-font-load
 * re-fit of cover titles.
 * @param container - Element that holds one or more `.ela-page` children.
 */
export async function prepareElaRenderElement( container: HTMLElement ): Promise< void > {
	await rafTwice();
	if ( document.fonts?.ready ) {
		try {
			await document.fonts.ready;
		} catch {
			// Best effort.
		}
	}
	await waitForImages( container );
	fitHeadlinesToCell( container );
	fitTablesToCell( container );
	shrinkHorizontalOverflows( container );

	// A pack display / headline font can finish loading just after the
	// first measurement: document.fonts.ready can settle before a face the
	// page only just started using is counted, and a brand font may be
	// wider/taller than the fallback the fit measured. That reflows a cover
	// title and re-introduces clipping in its tight 2-row cell. Wait once
	// more, then re-fit the cover titles.
	if ( document.fonts?.ready ) {
		try {
			await document.fonts.ready;
		} catch {
			// Best effort.
		}
	}
	await rafTwice();
	fitCoverTitlesIn( container );
}
