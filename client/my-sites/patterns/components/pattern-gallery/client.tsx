import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import { PropsWithChildren, useLayoutEffect, useRef, useState } from 'react';
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

function MasonryGallery( { children, className, enableMasonry }: MasonryGalleryProps ) {
	const ref = useRef< HTMLDivElement >( null );
	const [ maxHeight, setMaxHeight ] = useState( 0 );

	useLayoutEffect( () => {
		if ( ! ref.current ) {
			return;
		}

		const columns = [ 0, 0, 0 ];
		const element = ref.current;

		function calculateHeight() {
			const previews = element.querySelectorAll( '.pattern-preview' );

			for ( const preview of previews ) {
				const smallestColumn = Math.min( ...columns );
				const shortestColumnIndex = columns.indexOf( smallestColumn );

				const coords = preview.getBoundingClientRect();
				columns[ shortestColumnIndex ] += coords.height + 16;
			}

			setMaxHeight( Math.max( ...columns ) );
		}

		calculateHeight();

		element.addEventListener( 'patternPreviewResize', calculateHeight );

		return () => {
			element.removeEventListener( 'patternPreviewResize', calculateHeight );
		};
	} );

	return (
		<div className={ className } ref={ ref } style={ enableMasonry ? { maxHeight } : undefined }>
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
					enableMasonry
					key={ patternIdsByCategory.first.join( ',' ) }
				>
					{ patterns.map( ( pattern, i ) => (
						<PatternPreview
							canCopy={ isLoggedIn || i < LOGGED_OUT_USERS_CAN_COPY_COUNT }
							className={ classNames( {
								'pattern-preview--grid': isGridView,
								'pattern-preview--list': ! isGridView,
								'pattern-preview--page': isPageLayouts,
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
