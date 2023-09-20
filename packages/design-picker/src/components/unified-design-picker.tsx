import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { MShotsImage } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import classnames from 'classnames';
import photon from 'photon';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { SHOW_ALL_SLUG, DEFAULT_ASSEMBLER_DESIGN } from '../constants';
import {
	getDesignPreviewUrl,
	getMShotOptions,
	isBlankCanvasDesign,
	isDefaultGlobalStylesVariationSlug,
	filterDesignsByCategory,
} from '../utils';
import { UnifiedDesignPickerCategoryFilter } from './design-picker-category-filter/unified-design-picker-category-filter';
import PatternAssemblerCta, { usePatternAssemblerCtaData } from './pattern-assembler-cta';
import ThemeCard from './theme-card';
import type { Categorization } from '../hooks/use-categorization';
import type { Design, StyleVariation } from '../types';
import type { RefCallback } from 'react';
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	locale?: string;
	styleVariation?: StyleVariation;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( {
	design,
	locale,
	styleVariation,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	if ( design.is_externally_managed && design.screenshot ) {
		const fit = '479,360';
		const themeImgSrc = photon( design.screenshot, { fit } ) || design.screenshot;
		const themeImgSrcDoubleDpi = photon( design.screenshot, { fit, zoom: 2 } ) || design.screenshot;

		return (
			<img
				src={ themeImgSrc }
				srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
				alt={ design.description }
			/>
		);
	}

	return (
		<MShotsImage
			url={ getDesignPreviewUrl( design, {
				use_screenshot_overrides: true,
				style_variation: styleVariation,
				...( locale && { language: locale } ),
			} ) }
			aria-labelledby={ makeOptionId( design ) }
			alt=""
			options={ getMShotOptions( { scrollable: false, highRes: ! isMobile, isMobile } ) }
			scrollable={ false }
		/>
	);
};

interface TrackDesignViewProps {
	category?: string | null;
	design: Design;
	isPremiumThemeAvailable?: boolean;
}

/**
 * Hook to return a [callback ref](https://reactjs.org/docs/refs-and-the-dom.html#callback-refs)
 * that MUST be used as the `ref` prop on a `div` element.
 * The hook ensures that we generate theme display Tracks events when the user views
 * the underlying `div` element.
 *
 * @param { TrackDesignViewProps } designDetails Details around the design and current context.
 * @returns { Function } A callback ref that MUST be used on a div element for tracking.
 */
const useTrackDesignView = ( {
	category,
	design,
	isPremiumThemeAvailable,
}: TrackDesignViewProps ): RefCallback< HTMLDivElement > => {
	const observerRef = useRef< IntersectionObserver >();
	const [ viewedCategories, setViewedCategory ] = useState< string[] >( [] );

	// Use a callback as the ref so we get called for both mount and unmount events
	// We don't get both if we use useRef() and useEffect() together.
	return useCallback(
		( wrapperDiv: HTMLDivElement ) => {
			// If we've already viewed the design in this category,
			// we can skip setting up the handler
			if ( category && viewedCategories.includes( category ) ) {
				return;
			}

			// If we don't have a wrapper div, we aren't mounted and should remove the observer
			if ( ! wrapperDiv ) {
				observerRef.current?.disconnect?.();
				return;
			}

			const intersectionHandler = ( entries: IntersectionObserverEntry[] ) => {
				// Only fire once per category
				if ( ! wrapperDiv || ( category && viewedCategories.includes( category ) ) ) {
					return;
				}

				const [ entry ] = entries;
				if ( ! entry.isIntersecting ) {
					return;
				}

				const trackingCategory = category === SHOW_ALL_SLUG ? undefined : category;

				recordTracksEvent( 'calypso_design_picker_design_display', {
					category: trackingCategory,
					design_type: design.design_type,
					is_premium: design.is_premium,
					is_premium_available: isPremiumThemeAvailable,
					slug: design.slug,
					is_virtual: design.is_virtual,
					is_externally_managed: design.is_externally_managed,
				} );

				if ( category ) {
					// Mark the current and category as viewed
					setViewedCategory( ( existingCategories ) => [ ...existingCategories, category ] );
				}
			};

			observerRef.current = new IntersectionObserver( intersectionHandler, {
				// Only fire the event when 60% of the element becomes visible
				threshold: [ 0.6 ],
			} );

			observerRef.current.observe( wrapperDiv );
		},
		[ category, design, isPremiumThemeAvailable, observerRef, setViewedCategory, viewedCategories ]
	);
};

interface DesignCardProps {
	design: Design;
	locale: string;
	category?: string | null;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	getBadge: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
}

const DesignCard: React.FC< DesignCardProps > = ( {
	design,
	locale,
	category,
	isPremiumThemeAvailable,
	shouldLimitGlobalStyles,
	onChangeVariation,
	onPreview,
	getBadge,
} ) => {
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState< StyleVariation >();

	const { style_variations = [] } = design;
	const trackingDivRef = useTrackDesignView( { category, design, isPremiumThemeAvailable } );
	const isDefaultVariation = isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug );

	const isLockedStyleVariation =
		( ! design.is_premium && shouldLimitGlobalStyles && ! isDefaultVariation ) ?? false;

	return (
		<ThemeCard
			className="design-button-container"
			ref={ trackingDivRef }
			name={
				isDefaultVariation ? design.title : `${ design.title } – ${ selectedStyleVariation?.title }`
			}
			image={
				<DesignPreviewImage
					design={ design }
					locale={ locale }
					styleVariation={ selectedStyleVariation }
				/>
			}
			badge={ getBadge( design.slug, isLockedStyleVariation ) }
			styleVariations={ style_variations }
			selectedStyleVariation={ selectedStyleVariation }
			onImageClick={ () => onPreview( design, selectedStyleVariation ) }
			onStyleVariationClick={ ( variation ) => {
				onChangeVariation( design, variation );
				setSelectedStyleVariation( variation );
			} }
			onStyleVariationMoreClick={ () => onPreview( design ) }
		/>
	);
};

interface DesignPickerProps {
	locale: string;
	onDesignYourOwn: ( design: Design ) => void;
	onClickDesignYourOwnTopButton: ( design: Design ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	designs: Design[];
	categorization?: Categorization;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	getBadge: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
}

const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onDesignYourOwn,
	onClickDesignYourOwnTopButton,
	onPreview,
	onChangeVariation,
	designs,
	categorization,
	isPremiumThemeAvailable,
	shouldLimitGlobalStyles,
	getBadge,
} ) => {
	const hasCategories = !! Object.keys( categorization?.categories || {} ).length;
	const filteredDesigns = useMemo( () => {
		if ( categorization?.selection ) {
			return filterDesignsByCategory( designs, categorization.selection );
		}

		return designs;
	}, [ designs, categorization?.selection ] );

	const assemblerCtaData = usePatternAssemblerCtaData();

	return (
		<div>
			<div className="design-picker__filters">
				{ categorization && hasCategories && (
					<UnifiedDesignPickerCategoryFilter
						className="design-picker__category-filter"
						categories={ categorization.categories }
						onSelect={ categorization.onSelect }
						selectedSlug={ categorization.selection }
					/>
				) }
				{ assemblerCtaData.shouldGoToAssemblerStep && (
					<Button
						className={ classnames( 'design-picker__design-your-own-button', {
							'design-picker__design-your-own-button-without-categories': ! hasCategories,
						} ) }
						onClick={ () => onClickDesignYourOwnTopButton( DEFAULT_ASSEMBLER_DESIGN ) }
					>
						{ assemblerCtaData.title }
					</Button>
				) }
			</div>

			<div className="design-picker__grid">
				{ filteredDesigns.map( ( design, index ) => {
					if ( isBlankCanvasDesign( design ) ) {
						return null;
					}

					return (
						<DesignCard
							key={ index }
							category={ categorization?.selection }
							design={ design }
							locale={ locale }
							isPremiumThemeAvailable={ isPremiumThemeAvailable }
							shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
							onChangeVariation={ onChangeVariation }
							onPreview={ onPreview }
							getBadge={ getBadge }
						/>
					);
				} ) }
				<PatternAssemblerCta onButtonClick={ () => onDesignYourOwn( DEFAULT_ASSEMBLER_DESIGN ) } />
			</div>
		</div>
	);
};

export interface UnifiedDesignPickerProps {
	locale: string;
	onDesignYourOwn: ( design: Design ) => void;
	onClickDesignYourOwnTopButton: ( design: Design ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	onViewAllDesigns: () => void;
	designs: Design[];
	categorization?: Categorization;
	heading?: React.ReactNode;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	getBadge: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
}

const UnifiedDesignPicker: React.FC< UnifiedDesignPickerProps > = ( {
	locale,
	onDesignYourOwn,
	onClickDesignYourOwnTopButton,
	onPreview,
	onChangeVariation,
	onViewAllDesigns,
	designs,
	heading,
	categorization,
	isPremiumThemeAvailable,
	shouldLimitGlobalStyles,
	getBadge,
} ) => {
	const hasCategories = !! Object.keys( categorization?.categories || {} ).length;

	const { ref } = useInView( {
		onChange: ( inView ) => {
			if ( inView ) {
				onViewAllDesigns();
			}
		},
	} );
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	const bottomAnchorContent = <div className="design-picker__bottom_anchor" ref={ ref }></div>;

	return (
		<div
			className={ classnames(
				'design-picker',
				`design-picker--theme-light`,
				'design-picker__unified',
				{
					'design-picker--has-categories': hasCategories,
				}
			) }
		>
			{ heading }
			<div className="unified-design-picker__designs">
				<DesignPicker
					locale={ locale }
					onDesignYourOwn={ onDesignYourOwn }
					onClickDesignYourOwnTopButton={ onClickDesignYourOwnTopButton }
					onPreview={ onPreview }
					onChangeVariation={ onChangeVariation }
					designs={ designs }
					categorization={ categorization }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
					getBadge={ getBadge }
				/>
				{ bottomAnchorContent }
			</div>
		</div>
	);
};

export { UnifiedDesignPicker as default, DesignPreviewImage };
