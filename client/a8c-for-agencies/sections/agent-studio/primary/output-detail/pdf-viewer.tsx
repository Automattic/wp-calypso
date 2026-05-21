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

	// The wrap is fully CSS-sized: `width: 100%` and `aspect-ratio: 816
	// / 1056` give it the natural page proportions, so its rendered
	// height follows from its rendered width without JS. JS only has
	// to compute the `transform: scale(...)` factor that shrinks the
	// iframe — which is CSS-sized to the natural 816 × 1056 viewport —
	// down to the wrap's pixel width. `ResizeObserver` handles both
	// the initial layout and subsequent resizes.
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
		<div ref={ wrapRef } className="a4a-one-pager-viewer__iframe-wrap">
			<iframe
				title={ title }
				className="a4a-one-pager-viewer__iframe"
				srcDoc={ srcDoc }
				style={ { transform: scale > 0 ? `scale(${ scale })` : 'scale(0)' } }
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
