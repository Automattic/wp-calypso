import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import { PropsWithChildren, useLayoutEffect, useRef } from 'react';
import { PatternGalleryServer } from 'calypso/my-sites/patterns/components/pattern-gallery/server';
import {
	DESKTOP_VIEWPORT_WIDTH,
	PatternPreview,
} from 'calypso/my-sites/patterns/components/pattern-preview';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/controller';
import { PatternTypeFilter, type PatternGalleryFC } from 'calypso/my-sites/patterns/types';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

const LOGGED_OUT_USERS_CAN_COPY_COUNT = 3;

type MasonryGalleryProps = PropsWithChildren< {
	className?: string;
	enableMasonry: boolean;
} >;

// Simulates a Masonry layout by applying negative `margin-top` on every item that doesn't sit in
// the first row
function MasonryGallery( { children, className, enableMasonry }: MasonryGalleryProps ) {
	const ref = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		if ( ! ref.current || ! enableMasonry ) {
			return;
		}

		const element = ref.current;

		function calculateLayout() {
			const columnCount = getComputedStyle( element ).gridTemplateColumns.split( ' ' ).length;

			if ( columnCount === 1 ) {
				return;
			}

			const items = [ ...element.querySelectorAll< HTMLElement >( '.pattern-preview' ) ];

			// We calculate the difference between the top coordinates of each `.pattern-preview`
			// with the bottom coordinates of the first `.pattern-preview` in the same column. This
			// value is then used to set a negative `margin-top`, simulating a Masonry layout
			items.slice( columnCount ).forEach( ( item, i ) => {
				item.style.marginTop = '0';

				const firstRowBottom = items[ i ].getBoundingClientRect().bottom;
				const thisRowTop = item.getBoundingClientRect().top;

				item.style.marginTop = `${ firstRowBottom - thisRowTop }px`;
			} );
		}

		calculateLayout();
		element.addEventListener( 'patternPreviewResize', calculateLayout );

		return () => {
			element.removeEventListener( 'patternPreviewResize', calculateLayout );
		};
	}, [ enableMasonry ] );

	return (
		<div className={ className } ref={ ref }>
			{ children }
		</div>
	);
}

export const PatternGalleryClient: PatternGalleryFC = ( props ) => {
	const { getPatternPermalink, isGridView = false, patterns = [], patternTypeFilter } = props;

	const isLoggedIn = useSelector( isUserLoggedIn );
	const patternIdsByCategory = {
		first: patterns.map( ( { ID } ) => `${ ID }` ) ?? [],
	};
	const isPageLayouts = patternTypeFilter === PatternTypeFilter.PAGES;

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
					key={ patternIdsByCategory.first.join( ',' ) }
				>
					{ patterns.map( ( pattern, i ) => (
						<PatternPreview
							canCopy={ isLoggedIn || i < LOGGED_OUT_USERS_CAN_COPY_COUNT }
							className={ classNames( {
								'pattern-preview--grid': isGridView,
								'pattern-preview--list': ! isGridView,
							} ) }
							getPatternPermalink={ getPatternPermalink }
							isResizable={ ! isGridView }
							key={ pattern.ID }
							pattern={ pattern }
							viewportWidth={ isGridView ? DESKTOP_VIEWPORT_WIDTH : undefined }
						/>
					) ) }
				</MasonryGallery>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
