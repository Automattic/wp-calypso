import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import classNames from 'classnames';
import Masonry, { Options as MasonryOptions } from 'masonry-layout';
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

type MasonryWrapperProps = PropsWithChildren< {
	className?: string;
	enableMasonry: boolean;
	masonryOptions?: MasonryOptions;
} >;

function MasonryWrapper( {
	className,
	children,
	enableMasonry = false,
	masonryOptions,
}: MasonryWrapperProps ) {
	const ref = useRef< HTMLDivElement >( null );

	useLayoutEffect( () => {
		if ( ! ref.current || ! enableMasonry ) {
			return;
		}

		const element = ref.current;
		const masonry = new Masonry( element, masonryOptions );

		function resizeListener() {
			masonry.layout?.();
		}
		ref.current.addEventListener( 'pattern_preview_resize', resizeListener );

		return () => {
			masonry.destroy?.();
			element.removeEventListener( 'pattern_preview_resize', resizeListener );
		};
	}, [ enableMasonry, masonryOptions ] );

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
				<MasonryWrapper
					className={ classNames( 'pattern-gallery', {
						'pattern-gallery--grid': isGridView,
						'pattern-gallery--pages': isPageLayouts,
					} ) }
					enableMasonry={ isGridView && isPageLayouts }
					key={ patternIdsByCategory.first.join( ',' ) }
					masonryOptions={ {
						gutter: '.pattern-gallery__gutter',
						transitionDuration: 0,
					} }
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

					{ isGridView && isPageLayouts && <div className="pattern-gallery__gutter" /> }
				</MasonryWrapper>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
