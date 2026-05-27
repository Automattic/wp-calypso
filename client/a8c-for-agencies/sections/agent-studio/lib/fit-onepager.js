/* eslint-disable */
/**
 * One-pager content fitter — vanilla JS IIFE inlined into composed HTML so
 * Browserless executes it inside its headless Chrome before snapshotting PDF.
 *
 * Each .ela-page in the document is fitted in place after fonts/images settle:
 *   1. Grid lockdown (`minmax(0, 1fr)` so `clientHeight` is a fixed reference).
 *   2. Headline ramp + binary-search font-size for body headlines.
 *   3. Cover-title measured-line scoring with `transform: scale()` safety valve.
 *   4. Horizontal overflow shrink (walks up to nearest `[data-span]` track).
 *   5. Table font-size shrink.
 *   6. Sentence-level trim for overflowing `.b-small` blocks.
 * Sets `document.body.dataset.fitted = 'true'` when complete so Browserless'
 * `waitForSelector: 'body[data-fitted="true"]'` releases the snapshot.
 *
 * Hand-ported mirror of the Calypso preview fitter at
 * `client/a8c-for-agencies/sections/agent-studio/lib/fit-onepager.ts`.
 * When changing one, change both — same algorithm, same constants. Source:
 *   ~/Projects/a4a-rsm/src/services/renderElaPng.ts
 *   ~/Projects/a4a-rsm/src/services/paginate.ts (trim helpers only)
 */

( function ( global ) {
	const OVERFLOW_TOLERANCE = 1;
	const FONT_TIMEOUT_MS = 1500;
	const FIT_BUDGET_MS = 20000;

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

	const HEADLINE_RAMP = [ '0', '1', '2', '3', '4' ];

	function onDomReady( cb ) {
		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', cb, { once: true } );
		} else {
			cb();
		}
	}

	// Public entry point. `root` is anything with `.querySelectorAll` —
	// Document for Browserless / eval, ShadowRoot for the Calypso preview
	// (where `shadow.innerHTML = …` skips script execution, so the caller
	// loads this file once globally and then invokes `applyA4aFit` per
	// shadow tree it builds). Resolves when all passes finish or the
	// budget expires.
	function applyA4aFit( root ) {
		root = root || document;
		try {
			console.log( '[a4a-fit] applying to', root === document ? 'document' : 'shadow root' );
		} catch ( _ ) {}
		return runFit( root );
	}
	global.applyA4aFit = applyA4aFit;

	// Calypso bundles this module during build; the auto-IIFE must not
	// touch `document` on the SSR side. Browserless and the browser
	// preview both have `document` so the auto-run still fires there.
	if ( typeof document === 'undefined' ) {
		return;
	}

	onDomReady( function () {
		// Top-level invocation for Browserless + eval. Calypso also
		// loads this file globally (without `.ela-page` elements in
		// its top-level DOM), so this run is harmless when the
		// document tree has no pages — runFit's loop is empty. The
		// `data-fitted` flag is still set so Browserless'
		// `waitForSelector` releases.
		try {
			console.log(
				'[a4a-fit] loaded; passes: enforceFixedGrid, resolveBlockOverlaps, demoteExtraAnchors, fitHeadlinesToCell, fitTablesToCell, shrinkHorizontalOverflows, shrinkOverflowingSections, trimOverflowingSmallBlocks'
			);
		} catch ( _ ) {}
		let done = false;
		function signalDone() {
			if ( done ) {
				return;
			}
			done = true;
			try {
				if ( document.body ) {
					document.body.dataset.fitted = 'true';
				}
				console.log( '[a4a-fit] done' );
			} catch ( _ ) {}
		}
		setTimeout( signalDone, FIT_BUDGET_MS );

		runFit( document ).then( signalDone, signalDone );
	} );

	async function runFit( root ) {
		await waitForFonts();
		await raf2();
		await waitForImages( root );

		const pages = Array.prototype.slice.call( root.querySelectorAll( '.ela-page' ) );
		for ( let i = 0; i < pages.length; i++ ) {
			enforceFixedGrid( pages[ i ] );
			resolveBlockOverlaps( pages[ i ] );
			demoteExtraAnchors( pages[ i ] );
			fitHeadlinesToCell( pages[ i ] );
			fitTablesToCell( pages[ i ] );
			shrinkHorizontalOverflows( pages[ i ] );
			shrinkOverflowingSections( pages[ i ] );
			trimOverflowingSmallBlocks( pages[ i ] );
		}

		// Re-fit cover titles after pack fonts settle. `fitCoverTitle` is
		// idempotent so this cannot compound the shrink.
		await waitForFonts();
		await raf1();
		for ( let j = 0; j < pages.length; j++ ) {
			fitCoverTitlesIn( pages[ j ] );
		}
	}

	function waitForFonts() {
		if ( ! document.fonts || ! document.fonts.ready ) {
			return Promise.resolve();
		}
		return Promise.race( [
			document.fonts.ready.then( noop, noop ),
			new Promise( function ( resolve ) {
				setTimeout( resolve, FONT_TIMEOUT_MS );
			} ),
		] );
	}

	function noop() {}

	function raf1() {
		return new Promise( function ( resolve ) {
			requestAnimationFrame( function () {
				resolve();
			} );
		} );
	}

	function raf2() {
		return new Promise( function ( resolve ) {
			requestAnimationFrame( function () {
				requestAnimationFrame( function () {
					resolve();
				} );
			} );
		} );
	}

	function waitForImages( root ) {
		const imgs = Array.prototype.slice.call( root.querySelectorAll( 'img' ) );
		return Promise.all(
			imgs.map( function ( img ) {
				if ( img.complete && img.naturalWidth > 0 ) {
					return Promise.resolve();
				}
				return new Promise( function ( resolve ) {
					img.addEventListener(
						'load',
						function () {
							resolve();
						},
						{ once: true }
					);
					img.addEventListener(
						'error',
						function () {
							resolve();
						},
						{ once: true }
					);
				} );
			} )
		);
	}

	// Hard-cap every grid track on the page body. A bare `1fr` is
	// `minmax(auto, 1fr)`, whose `auto` minimum lets a row stretch past its
	// share to fit an oversized headline. `minmax(0, 1fr) !important` keeps
	// `clientHeight` a fixed reference for measurement.
	// Block overlap resolver — when the LLM emits two top-level blocks
	// whose grid-column ranges intersect AND grid-row ranges intersect,
	// CSS Grid stacks them visibly (e.g. `b-headline` at row 6/span 1
	// and `b-section` at row 6/span 7 paint the headline on top of the
	// section's first paragraph). The structural lint catches this and
	// asks the LLM to fix it on the next attempt; when it doesn't
	// converge, the rendered page ships with overlap. Walk source-order
	// pairs, detect overlap, shift the LATER block down so it clears
	// the earlier one. Cap shift at the grid's row 12 so we never push
	// content past the page; if a clean fit isn't possible the residual
	// overlap stays and the lint surfaces it.
	function resolveBlockOverlaps( page ) {
		const body = page.querySelector( '.page-body' );
		if ( ! body ) {
			return;
		}
		const GRID_LAST_ROW = 12;
		const blocks = Array.prototype.slice.call(
			body.querySelectorAll(
				':scope > [class^="b-"], :scope > .b-container, :scope > dl.b-facts, :scope > figure.b-quote, :scope > figure.b-image, :scope > aside'
			)
		);
		const rects = blocks.map( rectOf ).filter( function ( r ) {
			return r !== null;
		} );
		// Source-order pairs only — the LLM emits top-down, and shifting
		// the LATER block down preserves intent (headline above content).
		for ( let i = 0; i < rects.length; i++ ) {
			for ( let j = i + 1; j < rects.length; j++ ) {
				const a = rects[ i ];
				const b = rects[ j ];
				if ( ! overlaps( a, b ) ) {
					continue;
				}
				// Shift b's rowStart to max(b.rowStart, a.rowEnd). If
				// that pushes b past the last row, clamp and shrink
				// its span; we'd rather lose some prose tail than have
				// it paint on top of the headline above.
				const newStart = Math.max( b.rowStart, a.rowEnd );
				if ( newStart >= GRID_LAST_ROW ) {
					continue;
				}
				const newSpan = Math.max(
					1,
					Math.min( b.rowEnd - newStart, GRID_LAST_ROW + 1 - newStart )
				);
				b.rowStart = newStart;
				b.rowEnd = newStart + newSpan;
				b.el.style.gridRow = newStart + ' / span ' + newSpan;
			}
		}

		function rectOf( el ) {
			const style = el.getAttribute( 'style' ) || '';
			const col = style.match( /grid-column\s*:\s*(\d+)\s*\/\s*span\s*(\d+)/i );
			const row = style.match( /grid-row\s*:\s*(\d+)\s*\/\s*span\s*(\d+)/i );
			if ( ! col || ! row ) {
				return null;
			}
			return {
				el: el,
				colStart: parseInt( col[ 1 ], 10 ),
				colEnd: parseInt( col[ 1 ], 10 ) + parseInt( col[ 2 ], 10 ),
				rowStart: parseInt( row[ 1 ], 10 ),
				rowEnd: parseInt( row[ 1 ], 10 ) + parseInt( row[ 2 ], 10 ),
			};
		}
		function overlaps( a, b ) {
			return (
				a.colStart < b.colEnd &&
				b.colStart < a.colEnd &&
				a.rowStart < b.rowEnd &&
				b.rowStart < a.rowEnd
			);
		}
	}

	// Multi-anchor demote — when a body page emits more than one
	// `.b-headline` at h1/h2 register (no `data-level="3"|"4"`, no
	// `b-headline-subhead` class), keep the widest as the page anchor
	// and demote the rest to subhead register by adding the class and
	// the `data-level="3"` attribute. The ela-base.css sibling fallback
	// already shrinks the visible font, but downstream consumers (probes,
	// future CSS rules, Calypso preview port) inspect the attributes —
	// so we stamp them explicitly. Mirrors the PHP `demote_extra_anchors`
	// pass in `ability.a4a-op-layout-director-ela-v2.php` whose output
	// has been observed to disappear before reaching the rendered HTML.
	function demoteExtraAnchors( page ) {
		const body = page.querySelector( '.page-body' );
		if ( ! body ) {
			return;
		}
		const topLevelHeadlines = Array.prototype.slice.call(
			body.querySelectorAll( ':scope > .b-headline' )
		);
		const anchors = [];
		for ( let i = 0; i < topLevelHeadlines.length; i++ ) {
			const el = topLevelHeadlines[ i ];
			if ( el.classList.contains( 'b-headline-subhead' ) ) {
				continue;
			}
			const lvl = el.getAttribute( 'data-level' );
			if ( lvl === '3' || lvl === '4' ) {
				continue;
			}
			anchors.push( { el: el, span: spanOf( el ) } );
		}
		if ( anchors.length <= 1 ) {
			return;
		}
		anchors.sort( function ( a, b ) {
			return b.span - a.span;
		} );
		for ( let k = 1; k < anchors.length; k++ ) {
			anchors[ k ].el.classList.add( 'b-headline-subhead' );
			if ( ! anchors[ k ].el.hasAttribute( 'data-level' ) ) {
				anchors[ k ].el.setAttribute( 'data-level', '3' );
			}
		}

		function spanOf( el ) {
			const style = el.getAttribute( 'style' ) || '';
			const m = style.match( /grid-column\s*:\s*\d+\s*\/\s*span\s*(\d+)/i );
			return m ? parseInt( m[ 1 ], 10 ) : 0;
		}
	}

	function enforceFixedGrid( page ) {
		const bodies = page.querySelectorAll( '.page-body' );
		for ( let i = 0; i < bodies.length; i++ ) {
			const body = bodies[ i ];
			body.style.setProperty( 'grid-template-columns', 'repeat(5, minmax(0, 1fr))', 'important' );
			body.style.setProperty( 'grid-template-rows', 'repeat(12, minmax(0, 1fr))', 'important' );
			body.style.setProperty( 'grid-auto-rows', 'minmax(0, 1fr)', 'important' );
		}
	}

	function fitCoverTitlesIn( root ) {
		const titles = root.querySelectorAll(
			'.ela-page[data-page-role="cover"] .b-display, .ela-page[data-page-role="cover"] .b-headline'
		);
		const out = [];
		for ( let i = 0; i < titles.length; i++ ) {
			fitCoverTitle( titles[ i ] );
			out.push( titles[ i ] );
		}
		return out;
	}

	function fitHeadlinesToCell( page ) {
		const coverSet = new Set( fitCoverTitlesIn( page ) );
		const nodes = page.querySelectorAll( '.b-headline, .b-display, .b-quote' );
		const headlines = [];
		for ( let i = 0; i < nodes.length; i++ ) {
			if ( ! coverSet.has( nodes[ i ] ) ) {
				headlines.push( nodes[ i ] );
			}
		}

		for ( let k = 0; k < headlines.length; k++ ) {
			const el = headlines[ k ];
			const isDisplay = el.classList.contains( 'b-display' );
			const isQuote = el.classList.contains( 'b-quote' );
			const originalOverflow = el.style.overflow;
			el.style.overflow = 'hidden';
			try {
				if ( ! isDisplay && ! isQuote ) {
					let safety = HEADLINE_RAMP.length;
					while ( el.scrollHeight > el.clientHeight + 1 && safety-- > 0 ) {
						const current = el.dataset.level || '2';
						const idx = HEADLINE_RAMP.indexOf( current );
						if ( idx < 0 || idx >= HEADLINE_RAMP.length - 1 ) {
							break;
						}
						el.dataset.level = HEADLINE_RAMP[ idx + 1 ];
					}
				}
				if ( el.scrollHeight > el.clientHeight + 1 ) {
					const scaleTarget = isQuote ? el.querySelector( 'blockquote' ) || el : el;
					const minSize = isDisplay ? 28 : isQuote ? 18 : 14;
					binarySearchFontSizeToFit( el, scaleTarget, minSize );
				}
			} finally {
				el.style.overflow = originalOverflow;
			}
		}
	}

	function binarySearchFontSizeToFit( el, scaleTarget, minSize ) {
		const baseSize = parseFloat( getComputedStyle( scaleTarget ).fontSize );
		const baseLh = parseFloat( getComputedStyle( scaleTarget ).lineHeight );
		if ( ! isFinite( baseSize ) || baseSize <= 0 ) {
			return;
		}
		const lhRatio = isFinite( baseLh ) && baseLh > 0 ? baseLh / baseSize : 1.0;

		function apply( size ) {
			scaleTarget.style.fontSize = size + 'px';
			scaleTarget.style.lineHeight = size * lhRatio + 'px';
		}
		function fits( size ) {
			apply( size );
			return el.scrollHeight <= el.clientHeight + 1;
		}

		if ( ! fits( minSize ) ) {
			return;
		}

		let lo = minSize;
		let hi = baseSize;
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

	function fitCoverTitle( el ) {
		const doc = el.ownerDocument;
		let text = el.querySelector( ':scope > .ela-fit-text' );
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
		text.style.transformOrigin = el.dataset.align === 'bottom' ? 'bottom left' : 'top left';
		text.style.transform = 'scale(1)';

		// Idempotent re-entry: drop any prior fit (inline font-size /
		// line-height from a previous run) so `original` reads the CSS base.
		el.style.removeProperty( 'font-size' );
		el.style.removeProperty( 'line-height' );

		const original = parseFloat( getComputedStyle( el ).fontSize );
		const baseLh = parseFloat( getComputedStyle( el ).lineHeight );
		if ( ! isFinite( original ) || original <= 0 ) {
			return;
		}
		const lhRatio = isFinite( baseLh ) && baseLh > 0 ? baseLh / original : 1;

		const isDisplay = el.classList.contains( 'b-display' );
		const hardFloor = Math.max( isDisplay ? 40 : 24, original * 0.5 );
		const balanceFloor = Math.max( hardFloor, original * 0.66 );

		function apply( size ) {
			el.style.fontSize = size + 'px';
			el.style.lineHeight = size * lhRatio + 'px';
		}
		function overflowOf() {
			return {
				x: Math.max( 0, text.scrollWidth - el.clientWidth ),
				y: Math.max( 0, text.scrollHeight - el.clientHeight ),
			};
		}

		const sizes = candidateFontSizes( original, balanceFloor );
		let best = null;
		for ( let i = 0; i < sizes.length; i++ ) {
			const size = sizes[ i ];
			apply( size );
			text.style.transform = 'scale(1)';
			const of1 = overflowOf();
			const ratio = size / original;
			const score = scoreHeadlineCandidate( text, ratio ) + ( of1.x + of1.y ) * 1000;
			if ( ! best || score < best.score ) {
				best = { size: size, score: score };
			}
		}
		if ( ! best ) {
			return;
		}
		apply( best.size );
		text.style.transform = 'scale(1)';

		let of2 = overflowOf();
		if ( ( of2.x > 0 || of2.y > 0 ) && best.size > hardFloor ) {
			for ( let s = best.size * 0.96; s >= hardFloor; s *= 0.96 ) {
				apply( s );
				of2 = overflowOf();
				if ( of2.x <= 0 && of2.y <= 0 ) {
					return;
				}
			}
			apply( hardFloor );
		}

		of2 = overflowOf();
		if ( of2.x <= 0 && of2.y <= 0 ) {
			return;
		}

		// Final safety valve: scale the text so it cannot clip into the
		// block below. Font-size shrinking above handles reflow; this only
		// mops up.
		for ( let sc = 0.97; sc >= 0.4; sc = Math.round( ( sc - 0.03 ) * 100 ) / 100 ) {
			text.style.transform = 'scale(' + sc + ')';
			if (
				text.scrollWidth * sc <= el.clientWidth + 1 &&
				text.scrollHeight * sc <= el.clientHeight + 1
			) {
				break;
			}
		}
	}

	function candidateFontSizes( original, floor ) {
		const sizes = [];
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

	function scoreHeadlineCandidate( text, ratio ) {
		const content = ( text.textContent || '' ).trim().replace( /\s+/g, ' ' );
		const words = content.split( /\s+/ ).filter( Boolean );
		const lines = estimateHeadlineLines( text );
		if ( words.length < 4 || lines.length < 2 ) {
			return ( 1 - ratio ) * 80;
		}

		const lineLengths = lines.map( function ( line ) {
			return line.text.length;
		} );
		const averageChars =
			lineLengths.reduce( function ( a, b ) {
				return a + b;
			}, 0 ) / lineLengths.length;
		const averageWords = words.length / lines.length;
		const last = lines[ lines.length - 1 ];
		const lastWords = last.text.split( /\s+/ ).filter( Boolean );
		const shrinkPenalty = ( 1 - ratio ) * ( words.length >= 10 ? 28 : 68 );
		const targetAverageWords = words.length >= 14 ? 3 : words.length >= 10 ? 2.5 : 1.8;
		const avgWordsPenalty = Math.max( 0, targetAverageWords - averageWords ) * 16;
		const lineCountPenalty = lines.length * ( words.length >= 10 ? 2.2 : 0.8 );
		const raggedness =
			lineLengths.reduce( function ( sum, length ) {
				return sum + Math.abs( length - averageChars );
			}, 0 ) / lines.length;

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

		for ( let i = 0; i < lines.length; i++ ) {
			const lineWords = lines[ i ].text.toLowerCase().split( /\s+/ ).filter( Boolean );
			if ( ! lineWords.length ) {
				continue;
			}
			if ( lineWords.length === 1 && CONNECTOR_WORDS.has( lineWords[ 0 ] ) ) {
				score += 180;
			}
			if ( i < lines.length - 1 && CONNECTOR_WORDS.has( lineWords[ lineWords.length - 1 ] ) ) {
				score += 80;
			}
			if (
				i === lines.length - 1 &&
				lineWords.length <= 2 &&
				CONNECTOR_WORDS.has( lineWords[ 0 ] )
			) {
				score += 22;
			}
		}

		return score;
	}

	function estimateHeadlineLines( el ) {
		const range = el.ownerDocument.createRange();
		const fragments = [];
		collectTextFragments( el, range, fragments );
		range.detach();

		const grouped = [];
		for ( let i = 0; i < fragments.length; i++ ) {
			const fragment = fragments[ i ];
			let group = null;
			for ( let g = 0; g < grouped.length; g++ ) {
				if ( Math.abs( grouped[ g ].top - fragment.top ) < 2 ) {
					group = grouped[ g ];
					break;
				}
			}
			if ( group ) {
				group.parts.push( fragment.text );
			} else {
				grouped.push( { top: fragment.top, parts: [ fragment.text ] } );
			}
		}

		return grouped
			.sort( function ( a, b ) {
				return a.top - b.top;
			} )
			.map( function ( line ) {
				return { top: line.top, text: line.parts.join( ' ' ).replace( /\s+/g, ' ' ).trim() };
			} )
			.filter( function ( line ) {
				return line.text.length > 0;
			} );
	}

	function collectTextFragments( node, range, fragments ) {
		if ( node.nodeType === Node.TEXT_NODE ) {
			const text = node.textContent || '';
			const matches = text.matchAll ? text.matchAll( /\S+/g ) : matchAllPolyfill( text, /\S+/g );
			for ( const match of matches ) {
				const start = match.index || 0;
				range.setStart( node, start );
				range.setEnd( node, start + match[ 0 ].length );
				const rect = range.getBoundingClientRect();
				if ( rect.width > 0 && rect.height > 0 ) {
					fragments.push( { top: rect.top, text: match[ 0 ] } );
				}
			}
			return;
		}
		node.childNodes.forEach( function ( child ) {
			collectTextFragments( child, range, fragments );
		} );
	}

	// Defensive polyfill for `String.prototype.matchAll` — Browserless v2
	// runs modern Chromium, so the native version is normally there. Kept
	// for parity if the runtime is older than expected.
	function matchAllPolyfill( str, regex ) {
		const out = [];
		const flags = regex.flags.indexOf( 'g' ) >= 0 ? regex.flags : regex.flags + 'g';
		const re = new RegExp( regex.source, flags );
		let m;
		while ( ( m = re.exec( str ) ) !== null ) {
			out.push( m );
		}
		return out;
	}

	function shrinkHorizontalOverflows( root ) {
		const all = root.querySelectorAll( '*' );
		for ( let i = 0; i < all.length; i++ ) {
			const el = all[ i ];
			if ( ! hasDirectText( el ) ) {
				continue;
			}
			const baseSize = parseFloat( getComputedStyle( el ).fontSize );
			if ( ! isFinite( baseSize ) || baseSize < 8 ) {
				continue;
			}

			const fits = ( function ( target ) {
				return function () {
					if ( target.scrollWidth > target.clientWidth + 1 ) {
						return false;
					}
					const track = target.closest( '[data-span]' );
					if ( track && track !== target ) {
						const trackStyle = getComputedStyle( track );
						const padX =
							parseFloat( trackStyle.paddingLeft || '0' ) +
							parseFloat( trackStyle.paddingRight || '0' );
						const inner = track.clientWidth - padX;
						if ( target.getBoundingClientRect().width > inner + 1 ) {
							return false;
						}
					}
					return true;
				};
			} )( el );

			let factor = 1;
			let safety = 18;
			while ( ! fits() && factor > 0.4 && safety-- > 0 ) {
				factor *= 0.95;
				el.style.fontSize = baseSize * factor + 'px';
			}
		}
	}

	function hasDirectText( el ) {
		const kids = el.childNodes;
		for ( let i = 0; i < kids.length; i++ ) {
			if (
				kids[ i ].nodeType === Node.TEXT_NODE &&
				( kids[ i ].nodeValue || '' ).trim().length > 0
			) {
				return true;
			}
		}
		return false;
	}

	// Vertical-fit pass for `b-section` prose blocks. The LLM sometimes
	// claims a `grid-row: N / span M` cell whose pixel height (~85px per
	// row at the 12-row 1056px grid) is shorter than the rendered text
	// needs at the 16px / 24px base. The PHP `paginate_pages` only
	// paginates on declared row coordinates, so it does not catch this.
	// Shrink the offending b-section's font-size until it fits, with a
	// 65% floor (≈10.4px on a 16px base) — below that, prose is
	// unreadable and we leave the residual as a structural-lint signal.
	function shrinkOverflowingSections( page ) {
		const sections = Array.prototype.slice.call(
			page.querySelectorAll( '.page-body > .b-section' )
		);
		for ( let i = 0; i < sections.length; i++ ) {
			const el = sections[ i ];
			if ( el.scrollHeight <= el.clientHeight + 1 ) {
				continue;
			}
			// `.b-section > p` has explicit `font-size: 16px` / `line-height: 24px`
			// in ela-base.css, so shrinking the wrapper does nothing. Walk
			// the direct children and shrink each one in lockstep. Cache
			// the base size/line-height per child so re-applying the same
			// factor stays idempotent.
			const paras = Array.prototype.slice.call( el.querySelectorAll( ':scope > p' ) );
			if ( paras.length === 0 ) {
				continue;
			}
			const bases = paras.map( function ( p ) {
				const cs = getComputedStyle( p );
				const fs = parseFloat( cs.fontSize );
				const lh = parseFloat( cs.lineHeight );
				return {
					p: p,
					fs: isFinite( fs ) && fs > 0 ? fs : 16,
					lh: isFinite( lh ) && lh > 0 ? lh : 24,
				};
			} );
			let factor = 1;
			let safety = 24;
			while ( el.scrollHeight > el.clientHeight + 1 && factor > 0.62 && safety-- > 0 ) {
				factor *= 0.94;
				for ( let k = 0; k < bases.length; k++ ) {
					bases[ k ].p.style.fontSize = bases[ k ].fs * factor + 'px';
					bases[ k ].p.style.lineHeight = bases[ k ].lh * factor + 'px';
				}
			}
		}
	}

	function fitTablesToCell( root ) {
		const tables = root.querySelectorAll( '.b-table > table' );
		for ( let i = 0; i < tables.length; i++ ) {
			const table = tables[ i ];
			const block = table.closest( '.b-table' );
			if ( ! block ) {
				continue;
			}
			const baseSize = parseFloat( getComputedStyle( table ).fontSize );
			if ( ! isFinite( baseSize ) ) {
				continue;
			}

			let factor = 1;
			let safety = 10;
			while ( table.scrollHeight > block.clientHeight + 1 && factor > 0.7 && safety-- > 0 ) {
				factor *= 0.94;
				table.style.fontSize = baseSize * factor + 'px';
			}
		}
	}

	function trimOverflowingSmallBlocks( page ) {
		const raw = page.querySelectorAll( '.b-small' );
		const blocks = [];
		for ( let i = 0; i < raw.length; i++ ) {
			if ( ! raw[ i ].closest( '.b-container' ) ) {
				blocks.push( raw[ i ] );
			}
		}
		for ( let b = 0; b < blocks.length; b++ ) {
			const block = blocks[ b ];
			const ps = block.querySelectorAll( ':scope > p' );
			if ( ps.length === 0 ) {
				continue;
			}
			let safety = 200;
			while ( block.scrollHeight > block.clientHeight + OVERFLOW_TOLERANCE && safety-- > 0 ) {
				const lastP = block.querySelector( ':scope > p:last-of-type' );
				if ( ! lastP ) {
					break;
				}
				const text = lastP.textContent || '';
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
			if ( ! ( block.textContent || '' ).trim() ) {
				block.remove();
			}
		}
	}

	function trimToLastSentence( text ) {
		const t = ( text || '' ).trim();
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
} )( typeof window !== 'undefined' ? window : globalThis );
