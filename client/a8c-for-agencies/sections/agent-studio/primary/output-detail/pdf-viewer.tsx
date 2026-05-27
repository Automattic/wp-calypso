import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useState, type ReactNode } from 'react';

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

// Render each page in a same-origin iframe (no `sandbox` attribute so
// scripts execute and font/CSS network requests authenticate against
// the user's wpcom session). The collateral shell appends a fit.js
// IIFE before `</body>` that demotes extra anchors, shrinks overflowing
// b-section prose, and resolves block-grid overlaps inside the page —
// it has to actually run in the preview frame for the in-app preview
// to match the downloaded PDF (which Browserless runs the same script
// before snapshotting). A previous shadow-DOM-based approach achieved
// CSS isolation but `shadow.innerHTML = …` does not execute injected
// `<script>` tags, so the preview rendered raw pre-fit HTML while the
// PDF rendered post-fit; iframes give the same CSS isolation and
// execute the script natively.
function ShadowPage( { srcDoc, title }: { srcDoc: string; title: string } ) {
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

	return (
		<div
			ref={ wrapResizeRef }
			className="a4a-one-pager-viewer__iframe-wrap"
			aria-label={ title }
			role="img"
		>
			<iframe
				className="a4a-one-pager-viewer__iframe"
				title={ title }
				srcDoc={ srcDoc }
				style={ { transform: `scale(${ scale })` } }
				scrolling="no"
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
