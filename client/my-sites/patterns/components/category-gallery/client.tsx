import { BlockRendererProvider, PatternsRendererProvider } from '@automattic/block-renderer';
import { usePatternsRendererContext } from '@automattic/block-renderer/src/components/patterns-renderer-context';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { encodePatternId } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/utils';
import { CategoryGalleryServer } from 'calypso/my-sites/patterns/components/category-gallery/server';
import { LocalizedLink } from 'calypso/my-sites/patterns/components/localized-link';
import {
	GRID_VIEW_VIEWPORT_WIDTH,
	PatternPreview,
} from 'calypso/my-sites/patterns/components/pattern-preview';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter, Category, CategoryGalleryFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

type CategoryGalleryItemProps = {
	category: Category;
	patternTypeFilter: PatternTypeFilter;
};

function CategoryGalleryItem( { category, patternTypeFilter }: CategoryGalleryItemProps ) {
	const translate = useTranslate();
	const previewRef = useRef< HTMLDivElement >( null );
	const { renderedPatterns } = usePatternsRendererContext();

	const pattern =
		patternTypeFilter === PatternTypeFilter.PAGES
			? category.pagePreviewPattern
			: category.regularPreviewPattern;
	const patternId = encodePatternId( pattern?.ID ?? 0 );
	const renderedPattern = renderedPatterns[ patternId ];

	// This is needed to make iframe lazy loading work in Firefox and Safari, see
	// https://wp.me/pdtkmj-2wZ#comment-4707
	useEffect( () => {
		if ( ! previewRef.current || category.name !== 'footer' ) {
			return;
		}

		const element = previewRef.current;
		const timeoutId = setTimeout( () => {
			const iframe = element.querySelector( 'iframe' );
			iframe?.setAttribute( 'loading', 'eager' );
		}, 1000 );

		return () => {
			clearTimeout( timeoutId );
		};
	}, [ category, renderedPattern?.html ] );

	const patternCount =
		patternTypeFilter === PatternTypeFilter.PAGES
			? category.pagePatternCount
			: category.regularPatternCount;

	const patternCountText =
		patternTypeFilter === PatternTypeFilter.REGULAR
			? translate( '%(count)d pattern', '%(count)d patterns', {
					count: patternCount,
					args: { count: patternCount },
			  } )
			: translate( '%(count)d layout', '%(count)d layouts', {
					count: patternCount,
					args: { count: patternCount },
			  } );

	return (
		<LocalizedLink
			className="patterns-category-gallery__item"
			href={ getCategoryUrlPath( category.name, patternTypeFilter, false ) }
			key={ category.name }
		>
			<div
				className={ classNames( 'patterns-category-gallery__item-preview', {
					'patterns-category-gallery__item-preview--page-layout':
						patternTypeFilter === PatternTypeFilter.PAGES,
					'patterns-category-gallery__item-preview--mirrored': category.name === 'footer',
				} ) }
				ref={ previewRef }
			>
				<div className="patterns-category-gallery__item-preview-inner">
					<PatternPreview
						category={ category.name }
						className="pattern-preview--category-gallery"
						pattern={ pattern }
						patternTypeFilter={ patternTypeFilter }
						viewportWidth={ GRID_VIEW_VIEWPORT_WIDTH }
					/>
				</div>
			</div>

			<div className="patterns-category-gallery__item-name">{ category.label }</div>
			<div className="patterns-category-gallery__item-count">{ patternCountText }</div>
		</LocalizedLink>
	);
}

export const CategoryGalleryClient: CategoryGalleryFC = ( {
	categories,
	description,
	patternTypeFilter,
	title,
} ) => {
	const patternIdsByCategory = {
		page:
			categories
				?.filter( ( { pagePreviewPattern } ) => pagePreviewPattern )
				.map( ( { pagePreviewPattern } ) => `${ pagePreviewPattern?.ID }` ) ?? [],
		regular:
			categories
				?.filter( ( { regularPreviewPattern } ) => regularPreviewPattern )
				.map( ( { regularPreviewPattern } ) => `${ regularPreviewPattern?.ID }` ) ?? [],
	};

	return (
		<BlockRendererProvider
			siteId={ RENDERER_SITE_ID }
			placeholder={
				<CategoryGalleryServer
					categories={ categories }
					description={ description }
					patternTypeFilter={ patternTypeFilter }
					title={ title }
				/>
			}
		>
			<PatternsRendererProvider
				patternIdsByCategory={ patternIdsByCategory }
				shouldShufflePosts={ false }
				siteId={ RENDERER_SITE_ID }
			>
				<PatternsSection title={ title } description={ description }>
					<div
						className={ classNames( 'patterns-category-gallery', {
							'is-regular-patterns': patternTypeFilter === PatternTypeFilter.REGULAR,
							'is-page-patterns': patternTypeFilter === PatternTypeFilter.PAGES,
						} ) }
					>
						{ categories?.map( ( category ) => (
							<CategoryGalleryItem
								category={ category }
								key={ category.name }
								patternTypeFilter={ patternTypeFilter }
							/>
						) ) }
					</div>
				</PatternsSection>
			</PatternsRendererProvider>
		</BlockRendererProvider>
	);
};
