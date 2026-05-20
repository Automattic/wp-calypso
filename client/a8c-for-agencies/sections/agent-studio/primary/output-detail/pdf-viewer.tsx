import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { type ReactNode } from 'react';
import HtmlRenderPreview from '../../one-pager/react/html-render-preview';

import './pdf-viewer.scss';

export interface PdfViewerPage {
	html: string;
	role: 'cover' | 'body';
}

interface CoverNavigation {
	count: number;
	activeIndex: number;
	onSelect: ( idx: number ) => void;
}

interface Props {
	pages: PdfViewerPage[];
	/** Optional cover variant picker rendered as hover-revealed chevrons over the cover page. */
	coverNavigation?: CoverNavigation;
}

/**
 * Stacked single-page viewer for one-pager deliverables. Dark canvas, pages
 * stacked top-to-bottom at a uniform width, hover-revealed cover-variant
 * chevrons over the first page. v1 ships single-page only; spread / facing
 * layout is deferred.
 */
export default function PdfViewer( { pages, coverNavigation }: Props ) {
	if ( pages.length === 0 ) {
		return null;
	}

	return (
		<div className="a4a-one-pager-viewer">
			{ pages.map( ( pdfPage, idx ) => (
				<div
					key={ idx }
					className={ clsx( 'a4a-one-pager-viewer__page', {
						'is-cover': pdfPage.role === 'cover',
					} ) }
				>
					<div className="a4a-one-pager-viewer__frame">
						<HtmlRenderPreview
							html={ pdfPage.html }
							className="a4a-one-pager-viewer__html"
							ariaLabel={ pdfPage.role === 'cover' ? __( 'Cover' ) : __( 'Page' ) }
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
