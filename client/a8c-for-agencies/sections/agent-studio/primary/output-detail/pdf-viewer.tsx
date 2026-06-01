import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import './pdf-viewer.scss';

declare global {
	interface Window {
		applyA4aFit?: ( root: Document | ShadowRoot ) => Promise< void >;
	}
}

export interface PdfViewerPage {
	srcDoc: string;
	role: 'cover' | 'body';
}

interface CoverNavigation {
	count: number;
	activeIndex: number;
	onSelect: ( idx: number ) => void;
}

interface Props {
	pages: PdfViewerPage[];
	/** Hover-revealed chevrons over the cover page. */
	coverNavigation?: CoverNavigation;
}

// US Letter at 96dpi. The natural height only appears in CSS (see
// `aspect-ratio: 816 / 1056` on the wrap).
const PAGE_NATURAL_WIDTH = 816;

export default function PdfViewer( { pages, coverNavigation }: Props ) {
	if ( pages.length === 0 ) {
		return null;
	}

	return (
		<div className="a4a-one-pager-viewer">
			{ pages.map( ( page, idx ) => (
				<div
					key={ idx }
					className={ clsx( 'a4a-one-pager-viewer__page', {
						'is-cover': page.role === 'cover',
					} ) }
				>
					<div className="a4a-one-pager-viewer__frame">
						<ShadowPage
							srcDoc={ page.srcDoc }
							title={ page.role === 'cover' ? __( 'Cover' ) : __( 'Page' ) }
						/>
						{ idx === 0 && coverNavigation && coverNavigation.count > 1 && (
							<div className="a4a-one-pager-viewer__cover-nav">
								<CircleButton
									onClick={ () =>
										coverNavigation.onSelect(
											( coverNavigation.activeIndex - 1 + coverNavigation.count ) %
												coverNavigation.count
										)
									}
									label={ __( 'Previous cover' ) }
								>
									<Icon icon={ chevronLeft } size={ 24 } />
								</CircleButton>
								<CircleButton
									onClick={ () =>
										coverNavigation.onSelect(
											( coverNavigation.activeIndex + 1 ) % coverNavigation.count
										)
									}
									label={ __( 'Next cover' ) }
								>
									<Icon icon={ chevronRight } size={ 24 } />
								</CircleButton>
							</div>
						) }
					</div>
				</div>
			) ) }
		</div>
	);
}

// Inside a shadow tree there is no `html`, `body`, or `:root` — they're
// outside the boundary. The variant CSS targets the document root for
// width / font / color, so rewrite those selectors to `:host`.
const rewriteRootSelectors = ( css: string ): string =>
	css
		.replace( /\bhtml\s*,\s*body\b/g, ':host' )
		.replace( /(^|[\s,{}])html(?=[\s,{[:.])/g, '$1:host' )
		.replace( /(^|[\s,{}])body(?=[\s,{[:.])/g, '$1:host' )
		.replace( /(^|[\s,{}]):root(?=[\s,{[:.])/g, '$1:host' );

// `@font-face` declared inside a shadow root does not register the font
// face in Chrome / Safari / Firefox: the rule parses, DevTools shows it,
// `--wp--preset--font-family--display` still resolves to `Knockout`, but
// no face named `Knockout` is reachable from inside the shadow tree, so
// the browser falls through to `system-ui`. Faces registered on the host
// Document ARE visible inside every nested shadow root, so we peel
// `@font-face` blocks off the deck CSS at mount and append them to
// `document.head` instead. The Set dedupes by rule body so a multi-page
// deck (one shadow root per page, every page carrying the same face
// payload) does not register the same face N times.
const hoistedFontFaces = new Set< string >();

function hoistFontFaces( css: string ): string {
	return css.replace( /@font-face\s*\{[^}]*\}/g, ( rule ) => {
		if ( ! hoistedFontFaces.has( rule ) ) {
			hoistedFontFaces.add( rule );
			const style = document.createElement( 'style' );
			style.dataset.a4aFontFace = '';
			style.textContent = rule;
			document.head.appendChild( style );
		}
		return '';
	} );
}

const HOST_BASELINE =
	'<style>:host{display:block;width:816px;height:1056px;overflow:hidden;}</style>';

function ShadowPage( { srcDoc, title }: { srcDoc: string; title: string } ) {
	const hostRef = useRef< HTMLDivElement >( null );
	const [ scale, setScale ] = useState( 0 );
	const wrapResizeRef = useResizeObserver< HTMLDivElement >( ( entries ) => {
		const width = entries[ 0 ]?.contentRect.width ?? 0;
		if ( width > 0 ) {
			setScale( ( prev ) => {
				const next = width / PAGE_NATURAL_WIDTH;
				return prev === next ? prev : next;
			} );
		}
	} );

	useEffect( () => {
		const host = hostRef.current;
		if ( ! host ) {
			return;
		}
		const shadow = host.shadowRoot ?? host.attachShadow( { mode: 'open' } );
		const parsed = new DOMParser().parseFromString( srcDoc, 'text/html' );
		const styleMarkup = Array.from(
			parsed.head.querySelectorAll< HTMLElement >( 'style, link[rel="stylesheet"]' )
		)
			.map( ( node ) =>
				node.tagName === 'STYLE'
					? `<style>${ rewriteRootSelectors( hoistFontFaces( node.textContent ?? '' ) ) }</style>`
					: node.outerHTML
			)
			.join( '' );
		// Shadow roots don't execute scripts inserted via `innerHTML`,
		// so pull the deck's inline fit.js out of the parsed body and
		// re-attach it to the outer document. `window.applyA4aFit` is
		// the once-per-tab load marker.
		const scripts = Array.from( parsed.body.querySelectorAll( 'script' ) );
		parsed.body.querySelectorAll( 'script' ).forEach( ( s ) => s.remove() );
		shadow.innerHTML = HOST_BASELINE + styleMarkup + parsed.body.innerHTML;
		if ( ! window.applyA4aFit ) {
			const fitter = scripts.find( ( s ) => ( s.textContent ?? '' ).includes( 'applyA4aFit' ) );
			if ( fitter ) {
				const live = document.createElement( 'script' );
				live.textContent = fitter.textContent;
				document.head.appendChild( live );
			}
		}
		if ( window.applyA4aFit ) {
			window.applyA4aFit( shadow ).catch( ( e ) => {
				// eslint-disable-next-line no-console
				console.warn( '[a4a-preview] applyA4aFit error', e );
			} );
		}
	}, [ srcDoc, title ] );

	return (
		<div
			ref={ wrapResizeRef }
			className="a4a-one-pager-viewer__iframe-wrap"
			aria-label={ title }
			role="img"
		>
			<div
				ref={ hostRef }
				className="a4a-one-pager-viewer__iframe"
				style={ { transform: `scale(${ scale })` } }
			/>
		</div>
	);
}

function CircleButton( {
	children,
	className,
	label,
	onClick,
}: {
	children: ReactNode;
	className?: string;
	label: string;
	onClick: () => void;
} ) {
	return (
		<button
			type="button"
			className={ clsx( 'a4a-one-pager-viewer__circle-button', className ) }
			onClick={ onClick }
			aria-label={ label }
			title={ label }
		>
			{ children }
		</button>
	);
}
