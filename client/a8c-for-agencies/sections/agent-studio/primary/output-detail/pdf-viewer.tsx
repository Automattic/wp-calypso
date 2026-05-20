import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';

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
	const iframeRef = useRef< HTMLIFrameElement >( null );

	const fit = useCallback( () => {
		const iframe = iframeRef.current;
		const wrap = wrapRef.current;
		if ( ! iframe || ! wrap ) {
			return;
		}
		const slotWidth = wrap.clientWidth || window.innerWidth;
		const scale = slotWidth / PAGE_NATURAL_WIDTH;

		iframe.style.width = `${ PAGE_NATURAL_WIDTH }px`;
		iframe.style.height = `${ PAGE_NATURAL_HEIGHT }px`;
		iframe.style.transformOrigin = 'top left';
		iframe.style.transform = `scale(${ scale })`;
		wrap.style.height = `${ PAGE_NATURAL_HEIGHT * scale }px`;
	}, [] );

	// Run the fit once on mount (covers the case where iframe `onLoad`
	// fires before this effect attaches) and again on every resize.
	useEffect( () => {
		fit();
		window.addEventListener( 'resize', fit );
		return () => window.removeEventListener( 'resize', fit );
	}, [ fit ] );

	return (
		<div ref={ wrapRef } className="a4a-one-pager-viewer__iframe-wrap">
			<iframe
				ref={ iframeRef }
				title={ title }
				className="a4a-one-pager-viewer__iframe"
				srcDoc={ srcDoc }
				onLoad={ fit }
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
