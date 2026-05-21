import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import './pdf-viewer.scss';

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
	/** Optional cover-variant picker rendered as hover-revealed chevrons over the cover. */
	coverNavigation?: CoverNavigation;
}

// The Ela one-pager renderer produces a fixed US Letter at 96dpi
// canvas (`html, body { width: 816px; height: 1056px }` in
// `ela-base.css`, and `.ela-page` matches). The natural width is
// shared between JS (to compute the scale factor) and CSS (the
// iframe is sized to it absolutely). The natural height only appears
// in CSS — see `aspect-ratio: 816 / 1056` on the wrap.
const PAGE_NATURAL_WIDTH = 816;

/**
 * Stacked single-page viewer for one-pager deliverables. Dark canvas,
 * pages stacked top-to-bottom at a uniform width, hover-revealed
 * cover-variant chevrons over the first (cover) page.
 *
 * Each page renders into its own iframe scaled to the slot via a CSS
 * transform; the wrapper is sized to the scaled box so document flow
 * and the absolutely-positioned chevrons stay aligned to the visible
 * edges. Refits on window resize.
 */
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

/**
 * Rewrites CSS selectors that target the document root so they match
 * the shadow root's host element instead. Inside a shadow tree there
 * is no `html`, no `body`, no `:root` — they're outside the boundary.
 * The variant CSS (`mc-base.css`, `ela-base.css`) puts the page's
 * width/height/font/color on those selectors, so without this rewrite
 * the page would render unstyled.
 */
const rewriteRootSelectors = ( css: string ): string =>
	css
		.replace( /\bhtml\s*,\s*body\b/g, ':host' )
		.replace( /(^|[\s,{}])html(?=[\s,{[:.])/g, '$1:host' )
		.replace( /(^|[\s,{}])body(?=[\s,{[:.])/g, '$1:host' )
		.replace( /(^|[\s,{}]):root(?=[\s,{[:.])/g, '$1:host' );

/**
 * Renders a single one-pager page into a shadow root. The shadow
 * boundary isolates the variant's CSS from Calypso (no `body { width:
 * 816px }` leaking onto our document) and gives us deterministic
 * `transform: scale(...)` sizing without iframe viewport quirks.
 *
 * The host element is sized at the natural 816 × 1056 via CSS, and a
 * `ResizeObserver` on the wrap drives the inline `transform: scale`
 * factor that shrinks the host visually to fit the wrap's pixel
 * width. The wrap itself is CSS-sized (`aspect-ratio: 816 / 1056`)
 * so its height follows its width without JS.
 */
function ShadowPage( { srcDoc, title }: { srcDoc: string; title: string } ) {
	const wrapRef = useRef< HTMLDivElement >( null );
	const hostRef = useRef< HTMLDivElement >( null );
	const [ scale, setScale ] = useState( 0 );

	useLayoutEffect( () => {
		const host = hostRef.current;
		if ( ! host ) {
			return;
		}
		const shadow = host.shadowRoot ?? host.attachShadow( { mode: 'open' } );

		const parsed = new DOMParser().parseFromString( srcDoc, 'text/html' );
		const headChildren = Array.from(
			parsed.head.querySelectorAll< HTMLElement >( 'style, link[rel="stylesheet"]' )
		);
		const styleMarkup = headChildren
			.map( ( node ) => {
				if ( node.tagName === 'STYLE' ) {
					return `<style>${ rewriteRootSelectors( node.textContent ?? '' ) }</style>`;
				}
				return node.outerHTML;
			} )
			.join( '' );

		// `:host` baseline: lock the page to its natural 816 × 1056
		// canvas with `overflow: hidden`, so an LLM-emitted block that
		// escapes the bbox can't push the document past the wrap.
		const hostBaseline =
			'<style>:host{display:block;width:816px;height:1056px;overflow:hidden;}</style>';

		shadow.innerHTML = hostBaseline + styleMarkup + parsed.body.innerHTML;
	}, [ srcDoc ] );

	useLayoutEffect( () => {
		const wrap = wrapRef.current;
		if ( ! wrap ) {
			return;
		}
		const update = () => {
			const w = wrap.clientWidth;
			if ( w > 0 ) {
				setScale( w / PAGE_NATURAL_WIDTH );
			}
		};
		update();
		const observer = new ResizeObserver( update );
		observer.observe( wrap );
		return () => observer.disconnect();
	}, [] );

	return (
		<div
			ref={ wrapRef }
			className="a4a-one-pager-viewer__iframe-wrap"
			aria-label={ title }
			role="img"
		>
			<div
				ref={ hostRef }
				className="a4a-one-pager-viewer__iframe"
				style={ { transform: scale > 0 ? `scale(${ scale })` : 'scale(0)' } }
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
