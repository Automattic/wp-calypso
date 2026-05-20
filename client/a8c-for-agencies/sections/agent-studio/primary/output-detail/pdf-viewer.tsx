import { __ } from '@wordpress/i18n';
import { Icon, chevronLeft, chevronRight, columns, page } from '@wordpress/icons';
import clsx from 'clsx';
import { useState, type ReactNode } from 'react';
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

type ViewMode = 'single' | 'facing';

/**
 * Stacked page viewer modeled on the prototype: dark canvas, single or
 * facing-spread layouts, hover-revealed cover variant chevrons. The first
 * page is rendered as a standalone cover; subsequent pages pair up as
 * spreads when facing mode is on.
 */
export default function PdfViewer( { pages, coverNavigation }: Props ) {
	const [ viewMode, setViewMode ] = useState< ViewMode >( 'single' );

	if ( pages.length === 0 ) {
		return null;
	}

	return (
		<div className={ clsx( 'a4a-one-pager-viewer', `a4a-one-pager-viewer--${ viewMode }` ) }>
			<CircleButton
				className="a4a-one-pager-viewer__view-toggle"
				onClick={ () => setViewMode( ( m ) => ( m === 'single' ? 'facing' : 'single' ) ) }
				label={ viewMode === 'single' ? __( 'Show facing pages' ) : __( 'Show single pages' ) }
			>
				<Icon icon={ viewMode === 'single' ? columns : page } size={ 22 } />
			</CircleButton>
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
							refitToken={ viewMode }
							ariaLabel={
								pdfPage.role === 'cover'
									? __( 'Cover' )
									: /* translators: %d is a page number. */
									  __( 'Page' )
							}
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
