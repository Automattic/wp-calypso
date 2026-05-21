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
// `ela-base.css`, and `.ela-page` matches). Hard-coding these here
// lets us scale the iframe deterministically from the slot dimensions
// alone — no `iframe.contentDocument` access required, which keeps the
// `sandbox=""` boundary intact (an empty sandbox treats the content
// as opaque-origin, so the parent can't read the iframe document).
const PAGE_NATURAL_WIDTH = 816;
const PAGE_NATURAL_HEIGHT = 1056;

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
						<FittedIframe
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

function FittedIframe( { srcDoc, title }: { srcDoc: string; title: string } ) {
	const wrapRef = useRef< HTMLDivElement >( null );
	const [ scale, setScale ] = useState( 0 );

	// `ResizeObserver` on the wrap fires once on mount (so the initial
	// scale is computed even if `clientWidth` was 0 before layout
	// settled) and again on every layout change. This is more reliable
	// than depending on the iframe's `onLoad` + `window.resize`, which
	// raced with the parent's layout-settle in the dark-canvas viewer.
	useLayoutEffect( () => {
		const wrap = wrapRef.current;
		if ( ! wrap ) {
			return;
		}
		const update = () => {
			const slotWidth = wrap.clientWidth;
			if ( slotWidth === 0 ) {
				return;
			}
			setScale( slotWidth / PAGE_NATURAL_WIDTH );
		};
		update();
		const observer = new ResizeObserver( update );
		observer.observe( wrap );
		return () => observer.disconnect();
	}, [] );

	const scaledHeight = scale > 0 ? PAGE_NATURAL_HEIGHT * scale : 0;

	return (
		<div
			ref={ wrapRef }
			className="a4a-one-pager-viewer__iframe-wrap"
			style={ scaledHeight > 0 ? { height: `${ scaledHeight }px` } : undefined }
		>
			<iframe
				title={ title }
				className="a4a-one-pager-viewer__iframe"
				srcDoc={ srcDoc }
				width={ PAGE_NATURAL_WIDTH }
				height={ PAGE_NATURAL_HEIGHT }
				style={ {
					width: `${ PAGE_NATURAL_WIDTH }px`,
					height: `${ PAGE_NATURAL_HEIGHT }px`,
					transformOrigin: 'top left',
					transform: scale > 0 ? `scale(${ scale })` : 'scale(0)',
				} }
				// Empty sandbox: opaque-origin iframe with no script
				// execution. The variant HTML doesn't need scripts.
				sandbox=""
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
