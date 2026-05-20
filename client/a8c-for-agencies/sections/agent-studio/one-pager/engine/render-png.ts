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

function fitHeadlinesToCell( root: HTMLElement ): void {
	const headlines = Array.from(
		root.querySelectorAll< HTMLElement >( '.b-headline, .b-display, .b-quote' )
	);
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

function shrinkHorizontalOverflows( root: HTMLElement ): void {
	const all = Array.from( root.querySelectorAll< HTMLElement >( '*' ) );
	for ( const el of all ) {
		let hasText = false;
		for ( const node of Array.from( el.childNodes ) ) {
			if ( node.nodeType === Node.TEXT_NODE && ( node.nodeValue ?? '' ).trim() ) {
				hasText = true;
				break;
			}
		}
		if ( ! hasText ) {
			continue;
		}
		const baseSize = parseFloat( getComputedStyle( el ).fontSize );
		if ( ! Number.isFinite( baseSize ) || baseSize < 8 ) {
			continue;
		}
		let factor = 1;
		let safety = 18;
		while ( el.scrollWidth > el.clientWidth + 1 && factor > 0.4 && safety-- > 0 ) {
			factor *= 0.95;
			el.style.fontSize = `${ baseSize * factor }px`;
		}
	}
}

/**
 * Rasterizes a single page HTML string to a PNG data URL. Mounts the page
 * off-screen, waits for fonts and images, runs the fit pipeline, and snaps
 * via html-to-image at 2× pixel ratio.
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
 * Runs the fit pipeline on a live, mounted container so the on-screen preview
 * matches the exported PNG. Called by the HtmlRenderPreview component.
 * @param container - The element that holds a single .ela-page child.
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
}
