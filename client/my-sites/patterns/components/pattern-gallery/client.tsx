import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { PropsWithChildren, useLayoutEffect, useRef, useState } from 'react';
import { PatternGalleryServer } from 'calypso/my-sites/patterns/components/pattern-gallery/server';
import {
	DESKTOP_VIEWPORT_WIDTH,
	PatternPreview,
} from 'calypso/my-sites/patterns/components/pattern-preview';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { PatternTypeFilter, type PatternGalleryFC } from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

function debounce( callback: () => void ) {
	let handle: number;

	return () => {
		window.cancelAnimationFrame( handle );
		handle = window.requestAnimationFrame( () => {
			callback();
		} );
	};
}

function calculateMasonryLayout( element: HTMLElement, itemSelector: string ) {
	const elementStyle = getComputedStyle( element );
	const columnCount = elementStyle.gridTemplateColumns.split( ' ' ).length;
	const parsedRowGap = /(\d+(\.\d+)?)px/.exec( elementStyle.rowGap );
	const rowGap = parseFloat( parsedRowGap?.[ 1 ] ?? '0' );

	const items = [ ...element.querySelectorAll< HTMLElement >( itemSelector ) ];

	if ( columnCount === 1 ) {
		items.forEach( ( item ) => {
			item.style.removeProperty( 'margin-top' );
		} );

		return;
	}

	// Always reset all items on the first row, since the number of grid columns is variable
	items.slice( 0, columnCount ).forEach( ( item ) => {
		item.style.removeProperty( 'margin-top' );
	} );

	// We calculate the difference between the top coordinates of each item with the bottom
	// coordinates of the first item in the same column. This value is then used to set a negative
	// `margin-top`, simulating a Masonry layout
	items.slice( columnCount ).forEach( ( item, i ) => {
		const firstRowBottom = items[ i ].getBoundingClientRect().bottom;
		const thisRowTop = item.getBoundingClientRect().top;

		const parsedMarginTop = /(-?\d+(\.\d+)?)px/.exec( item.style.marginTop );
		const currentMarginTop = parseFloat( parsedMarginTop?.[ 1 ] ?? '0' );

		const marginTop = firstRowBottom - thisRowTop + rowGap + currentMarginTop;

		if ( marginTop <= -1 ) {
			item.style.marginTop = `${ marginTop }px`;
		} else {
			item.style.removeProperty( 'margin-top' );
		}
	} );
}

type MasonryGalleryProps = PropsWithChildren< {
	className?: string;
	enableMasonry: boolean;
	itemSelector: string;
} >;

// Simulates a Masonry layout by applying negative `margin-top` on every item that doesn't sit in
// the first row
function MasonryGallery( {
	children,
	className,
	enableMasonry,
	itemSelector,
}: MasonryGalleryProps ) {
	const ref = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		if ( ! ref.current || ! enableMasonry ) {
			return;
		}

		const element = ref.current;

		calculateMasonryLayout( element, itemSelector );
		const onLayoutChange = debounce( () => calculateMasonryLayout( element, itemSelector ) );
		element.addEventListener( 'patternPreviewResize', onLayoutChange );

		return () => {
			element.removeEventListener( 'patternPreviewResize', onLayoutChange );
		};
	}, [ enableMasonry, itemSelector ] );

	return (
		<div className={ className } ref={ ref }>
			{ children }
		</div>
	);
}

const LOGGED_OUT_USERS_CAN_COPY_COUNT = 3;
const PATTERNS_PER_PAGE_COUNT = 9;

export const PatternGalleryClient: PatternGalleryFC = ( props ) => {
	const {
		category,
		getPatternPermalink,
		isGridView = false,
		patterns = [],
		patternTypeFilter,
	} = props;

	const translate = useTranslate();

	const [ patternDisplayCount, setPatternDisplayCount ] = useState( () => {
		if ( /#pattern-/.test( window.location.hash ) ) {
			return Infinity;
		}

		return PATTERNS_PER_PAGE_COUNT;
	} );
	const isLoggedIn = useSelector( isUserLoggedIn );

	const patternIdsByCategory = {
		first: patterns.map( ( { ID } ) => `${ ID }` ) ?? [],
	};
	const isPageLayouts = patternTypeFilter === PatternTypeFilter.PAGES;

	const patternsToDisplay = patterns.slice( 0, patternDisplayCount );
	const shouldDisplayPaginationButton = patternsToDisplay.length < patterns.length;
	const nextPageCount = Math.min(
		patterns.length - patternsToDisplay.length,
		PATTERNS_PER_PAGE_COUNT
	);

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={ <PatternGalleryServer { ...props } /> }
		>
			<PatternsRendererProvider
				patternIdsByCategory={ patternIdsByCategory }
				shouldShufflePosts={ false }
				siteId={ RENDERER_SITE_ID }
			>
				<MasonryGallery
					className={ classNames( 'pattern-gallery', {
						'pattern-gallery--grid': isGridView,
						'pattern-gallery--pages': isPageLayouts,
					} ) }
					enableMasonry={ isGridView && isPageLayouts }
					itemSelector=".pattern-preview"
				>
					{ patternsToDisplay.map( ( pattern, i ) => (
						<PatternPreview
							canCopy={ isLoggedIn || i < LOGGED_OUT_USERS_CAN_COPY_COUNT }
							category={ category }
							className={ classNames( {
								'pattern-preview--grid': isGridView,
								'pattern-preview--list': ! isGridView,
							} ) }
							getPatternPermalink={ getPatternPermalink }
							isGridView={ isGridView }
							isResizable={ ! isGridView }
							key={ pattern.ID }
							pattern={ pattern }
							patternTypeFilter={ patternTypeFilter }
							viewportWidth={ isGridView ? DESKTOP_VIEWPORT_WIDTH : undefined }
						/>
					) ) }

					{ shouldDisplayPaginationButton && (
						<div className="pattern-gallery__pagination-button-wrapper">
							<Button
								className="pattern-gallery__pagination-button"
								onClick={ () => {
									setPatternDisplayCount( patternDisplayCount + PATTERNS_PER_PAGE_COUNT );
								} }
								transparent
							>
								{ translate( 'Load %(count)d more pattern', 'Load %(count)d more patterns', {
									count: nextPageCount,
									args: { count: nextPageCount },
									comment: 'Pagination button on Pattern Library pages',
								} ) }
							</Button>
						</div>
					) }
				</MasonryGallery>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
