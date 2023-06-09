import { recordTracksEvent } from '@automattic/calypso-analytics';
import { MShotsImage } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { SHOW_ALL_SLUG } from '../constants';
import {
	getDesignPreviewUrl,
	getMShotOptions,
	isBlankCanvasDesign,
	filterDesignsByCategory,
} from '../utils';
import { UnifiedDesignPickerCategoryFilter } from './design-picker-category-filter/unified-design-picker-category-filter';
import PatternAssemblerCta from './pattern-assembler-cta';
import ThemeCard from './theme-card';
import type { Categorization } from '../hooks/use-categorization';
import type { Design, StyleVariation } from '../types';
import type { RefCallback } from 'react';
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
	styleVariation?: StyleVariation;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( {
	design,
	locale,
	styleVariation,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<MShotsImage
			url={ getDesignPreviewUrl( design, {
				language: locale,
				use_screenshot_overrides: true,
				style_variation: styleVariation,
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
	getBadge: ( themeId: string, forcePremium: boolean, tooltipMessage: string ) => React.ReactNode;
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
	const { __ } = useI18n();
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState< StyleVariation >();

	const { style_variations = [] } = design;
	const trackingDivRef = useTrackDesignView( { category, design, isPremiumThemeAvailable } );
	const isDefaultVariation = ! selectedStyleVariation || selectedStyleVariation.slug === 'default';

	const isPremiumStyleVariation =
		( ! design.is_premium && shouldLimitGlobalStyles && ! isDefaultVariation ) ?? false;
	const badgeTooltipMessage = isPremiumStyleVariation
		? __( 'Unlock this style, and tons of other features, by upgrading to a Premium plan.' )
		: '';

	return (
		<ThemeCard
			className="design-button-container"
			ref={ trackingDivRef }
			name={
				isDefaultVariation ? design.title : `${ design.title } – ${ selectedStyleVariation.title }`
			}
			image={
				<DesignPreviewImage
					design={ design }
					locale={ locale }
					styleVariation={ selectedStyleVariation }
				/>
			}
			badge={ getBadge( design.slug, isPremiumStyleVariation, badgeTooltipMessage ) }
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
	onSelectBlankCanvas: ( design: Design, shouldGoToAssemblerStep: boolean ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	designs: Design[];
	categorization?: Categorization;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	getBadge: ( themeId: string, forcePremium: boolean, tooltipMessage: string ) => React.ReactNode;
}

const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onSelectBlankCanvas,
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

	return (
		<div>
			{ categorization && hasCategories && (
				<UnifiedDesignPickerCategoryFilter
					categories={ categorization.categories }
					onSelect={ categorization.onSelect }
					selectedSlug={ categorization.selection }
				/>
			) }
			<div className="design-picker__grid">
				{ filteredDesigns.map( ( design, index ) => {
					if ( isBlankCanvasDesign( design ) ) {
						return (
							<PatternAssemblerCta
								key={ index }
								onButtonClick={ ( shouldGoToAssemblerStep ) =>
									onSelectBlankCanvas( design, shouldGoToAssemblerStep )
								}
							/>
						);
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
			</div>
		</div>
	);
};

export interface UnifiedDesignPickerProps {
	locale: string;
	onSelectBlankCanvas: ( design: Design, shouldGoToAssemblerStep: boolean ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	onViewAllDesigns: () => void;
	designs: Design[];
	categorization?: Categorization;
	heading?: React.ReactNode;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	getBadge: ( themeId: string, forcePremium: boolean, tooltipMessage: string ) => React.ReactNode;
}

const UnifiedDesignPicker: React.FC< UnifiedDesignPickerProps > = ( {
	locale,
	onSelectBlankCanvas,
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
					onSelectBlankCanvas={ onSelectBlankCanvas }
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
