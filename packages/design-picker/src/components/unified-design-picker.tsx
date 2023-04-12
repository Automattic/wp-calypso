/* eslint-disable wpcalypso/jsx-classname-namespace */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FEATURE_WOOP } from '@automattic/calypso-products';
import { MShotsImage } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useInView } from 'calypso/lib/use-in-view'; // eslint-disable-line no-restricted-imports
import {
	SHOW_ALL_SLUG,
	SHOW_GENERATED_DESIGNS_SLUG,
	DEFAULT_VIEWPORT_WIDTH,
	DEFAULT_VIEWPORT_HEIGHT,
	MOBILE_VIEWPORT_WIDTH,
} from '../constants';
import {
	getDesignPreviewUrl,
	getMShotOptions,
	isBlankCanvasDesign,
	filterDesignsByCategory,
} from '../utils';
import { UnifiedDesignPickerCategoryFilter } from './design-picker-category-filter/unified-design-picker-category-filter';
import PatternAssemblerCta from './pattern-assembler-cta';
import PremiumBadge from './premium-badge';
import ThemeCard from './theme-card';
import ThemePreview from './theme-preview';
import WooCommerceBundledBadge from './woocommerce-bundled-badge';
import type { Categorization } from '../hooks/use-categorization';
import type { Design, StyleVariation } from '../types';
import type { RefCallback } from 'react';
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
	verticalId?: string;
	styleVariation?: StyleVariation;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( {
	design,
	locale,
	verticalId,
	styleVariation,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<MShotsImage
			url={ getDesignPreviewUrl( design, {
				language: locale,
				vertical_id: design.verticalizable ? verticalId : undefined,
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
	verticalId?: string;
	currentPlanFeatures?: string[];
	hasPurchasedTheme?: boolean;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
}

const DesignCard: React.FC< DesignCardProps > = ( {
	design,
	locale,
	category,
	verticalId,
	currentPlanFeatures,
	hasPurchasedTheme = false,
	isPremiumThemeAvailable,
	shouldLimitGlobalStyles,
	onChangeVariation,
	onPreview,
} ) => {
	const { __ } = useI18n();
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState< StyleVariation >();

	const { style_variations = [] } = design;
	const trackingDivRef = useTrackDesignView( { category, design, isPremiumThemeAvailable } );
	const isDefaultVariation = ! selectedStyleVariation || selectedStyleVariation.slug === 'default';

	const currentSiteCanInstallWoo = currentPlanFeatures?.includes( FEATURE_WOOP ) ?? false;
	const designIsBundledWithWoo = design.is_bundled_with_woo_commerce;
	const isPremium = design.is_premium || ( shouldLimitGlobalStyles && ! isDefaultVariation );
	const shouldUpgrade = isPremium && ! isPremiumThemeAvailable && ! hasPurchasedTheme;

	function getPricingDescription() {
		let text: React.ReactNode = null;

		if ( designIsBundledWithWoo ) {
			text = currentSiteCanInstallWoo
				? __( 'Included in your plan' )
				: __( 'Available with WordPress.com Business' );
		} else if ( isPremium && shouldUpgrade ) {
			text = __( 'Included in WordPress.com Premium' );
		} else if ( isPremium && ! shouldUpgrade && hasPurchasedTheme ) {
			text = __( 'Purchased on an annual subscription' );
		} else if ( isPremium && ! shouldUpgrade && ! hasPurchasedTheme ) {
			text = __( 'Included in your plan' );
		} else if ( ! isPremium ) {
			text = __( 'Free' );
		}

		let badge: React.ReactNode = null;
		if ( designIsBundledWithWoo ) {
			badge = <WooCommerceBundledBadge />;
		} else if ( isPremium ) {
			const showStyleVariationTooltip =
				! isDefaultVariation && shouldUpgrade && ! design.is_premium;
			const tooltipText = showStyleVariationTooltip
				? __( 'Unlock this style, and tons of other features, by upgrading to a Premium plan.' )
				: undefined;
			badge = (
				<PremiumBadge
					tooltipPosition="bottom right"
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					tooltipContent={ tooltipText }
				/>
			);
		}

		return (
			<>
				{ badge }
				<span>{ text }</span>
			</>
		);
	}

	return (
		<ThemeCard
			ref={ trackingDivRef }
			name={
				isDefaultVariation ? design.title : `${ design.title } – ${ selectedStyleVariation.title }`
			}
			image={
				<DesignPreviewImage
					design={ design }
					locale={ locale }
					verticalId={ verticalId }
					styleVariation={ selectedStyleVariation }
				/>
			}
			badge={ getPricingDescription() }
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

interface DesignButtonContainerProps extends DesignCardProps {
	category?: string | null;
	onSelectBlankCanvas: ( design: Design, shouldGoToAssemblerStep: boolean ) => void;
}

const DesignButtonContainer: React.FC< DesignButtonContainerProps > = ( {
	category,
	onSelectBlankCanvas,
	...props
} ) => {
	if ( isBlankCanvasDesign( props.design ) ) {
		return (
			<PatternAssemblerCta
				onButtonClick={ ( shouldGoToAssemblerStep ) =>
					onSelectBlankCanvas( props.design, shouldGoToAssemblerStep )
				}
			/>
		);
	}

	return (
		<DesignCard
			category={ category }
			design={ props.design }
			locale={ props.locale }
			verticalId={ props.verticalId }
			isPremiumThemeAvailable={ props.isPremiumThemeAvailable }
			onChangeVariation={ props.onChangeVariation }
			onPreview={ props.onPreview }
		/>
	);
};

interface GeneratedDesignButtonContainerProps {
	locale: string;
	design: Design;
	verticalId?: string;
	isShowing: boolean;
	onPreview: ( design: Design ) => void;
}

const GeneratedDesignButtonContainer: React.FC< GeneratedDesignButtonContainerProps > = ( {
	locale,
	design,
	verticalId,
	isShowing,
	onPreview,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );
	const previewUrl = getDesignPreviewUrl( design, {
		language: locale,
		vertical_id: verticalId,
		viewport_width: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
		viewport_height: DEFAULT_VIEWPORT_HEIGHT,
		use_screenshot_overrides: true,
	} );

	const trackingDivRef = useTrackDesignView( {
		category: `__generated_vertical_${ verticalId }`,
		design,
		isPremiumThemeAvailable: false,
	} );

	return (
		<div
			className={ classnames( 'design-button-container', 'design-button-container--is-generated', {
				'design-button-container--is-generated--is-showing': isShowing,
			} ) }
			ref={ trackingDivRef }
		>
			<div className="design-picker__design-option">
				<button className="generated-design-thumbnail" onClick={ () => onPreview( design ) }>
					<span className="generated-design-thumbnail__image design-picker__image-frame design-picker__image-frame-no-header">
						<ThemePreview
							url={ previewUrl }
							viewportWidth={ isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH }
							isFitHeight
						/>
					</span>
				</button>
			</div>
		</div>
	);
};

interface GeneratedDesignPickerProps {
	locale: string;
	designs: Design[];
	verticalId?: string;
	onPreview: ( design: Design ) => void;
}

const GeneratedDesignPicker: React.FC< GeneratedDesignPickerProps > = ( {
	locale,
	designs,
	verticalId,
	onPreview,
} ) => (
	<div className="design-picker__grid">
		{ designs.map( ( design ) => (
			<GeneratedDesignButtonContainer
				key={ `generated-design__${ design.slug }` }
				design={ design }
				locale={ locale }
				verticalId={ verticalId }
				isShowing
				onPreview={ onPreview }
			/>
		) ) }
	</div>
);

const wasThemePurchased = ( purchasedThemes: string[] | undefined, design: Design ) =>
	purchasedThemes
		? purchasedThemes.some( ( themeId ) => design?.recipe?.stylesheet?.endsWith( '/' + themeId ) )
		: false;

interface DesignPickerProps {
	locale: string;
	verticalId?: string;
	onSelectBlankCanvas: ( design: Design, shouldGoToAssemblerStep: boolean ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	staticDesigns: Design[];
	generatedDesigns: Design[];
	categorization?: Categorization;
	isPremiumThemeAvailable?: boolean;
	purchasedThemes?: string[];
	currentPlanFeatures?: string[];
	shouldLimitGlobalStyles?: boolean;
}

const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onSelectBlankCanvas,
	onPreview,
	onChangeVariation,
	staticDesigns,
	generatedDesigns,
	categorization,
	isPremiumThemeAvailable,
	verticalId,
	purchasedThemes,
	currentPlanFeatures,
	shouldLimitGlobalStyles,
} ) => {
	const hasCategories = !! categorization?.categories.length;
	const filteredStaticDesigns = useMemo( () => {
		if ( categorization?.selection ) {
			return filterDesignsByCategory( staticDesigns, categorization.selection );
		}

		return staticDesigns;
	}, [ staticDesigns, categorization?.selection ] );

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
				{ filteredStaticDesigns.map( ( design, index ) => (
					<DesignButtonContainer
						category={ categorization?.selection }
						key={ index }
						design={ design }
						locale={ locale }
						onSelectBlankCanvas={ onSelectBlankCanvas }
						onPreview={ onPreview }
						onChangeVariation={ onChangeVariation }
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
						verticalId={ verticalId }
						hasPurchasedTheme={ wasThemePurchased( purchasedThemes, design ) }
						currentPlanFeatures={ currentPlanFeatures }
						shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
					/>
				) ) }
				{ categorization?.selection === SHOW_GENERATED_DESIGNS_SLUG &&
					generatedDesigns.map( ( design ) => (
						<GeneratedDesignButtonContainer
							key={ `generated-design__${ design.slug }` }
							design={ design }
							locale={ locale }
							verticalId={ verticalId }
							isShowing
							onPreview={ onPreview }
						/>
					) ) }
			</div>
		</div>
	);
};

export interface UnifiedDesignPickerProps {
	locale: string;
	verticalId?: string;
	onSelect: ( design: Design ) => void;
	onSelectBlankCanvas: ( design: Design, shouldGoToAssemblerStep: boolean ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	onViewAllDesigns: () => void;
	generatedDesigns: Design[];
	staticDesigns: Design[];
	categorization?: Categorization;
	heading?: React.ReactNode;
	isPremiumThemeAvailable?: boolean;
	purchasedThemes?: string[];
	currentPlanFeatures?: string[];
	shouldLimitGlobalStyles?: boolean;
}

const UnifiedDesignPicker: React.FC< UnifiedDesignPickerProps > = ( {
	locale,
	onSelectBlankCanvas,
	onPreview,
	onChangeVariation,
	onViewAllDesigns,
	verticalId,
	staticDesigns,
	generatedDesigns,
	heading,
	categorization,
	isPremiumThemeAvailable,
	purchasedThemes,
	currentPlanFeatures,
	shouldLimitGlobalStyles,
} ) => {
	const translate = useTranslate();
	const hasCategories = !! categorization?.categories.length;
	const hasGeneratedDesigns = generatedDesigns.length > 0;
	const isShowAll = ! categorization?.selection || categorization?.selection === SHOW_ALL_SLUG;

	// Track as if user has scrolled to bottom of the design picker
	const ref = useInView< HTMLDivElement >( onViewAllDesigns, {}, [ categorization?.selection ] );
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
					staticDesigns={ staticDesigns }
					generatedDesigns={ generatedDesigns }
					categorization={ categorization }
					verticalId={ verticalId }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					purchasedThemes={ purchasedThemes }
					currentPlanFeatures={ currentPlanFeatures }
					shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
				/>
				{ ( ! isShowAll || ! hasGeneratedDesigns ) && bottomAnchorContent }
			</div>
			{ hasGeneratedDesigns && (
				<div
					className={ classnames( 'unified-design-picker__generated-designs', {
						'unified-design-picker__generated-designs--is-showing': isShowAll,
					} ) }
				>
					<div>
						<h3 className="unified-design-picker__title">
							{ translate( 'Custom designs for your site' ) }
						</h3>
						<p className="unified-design-picker__subtitle">
							{ translate( 'Based on your input, these designs have been tailored for you.' ) }
						</p>
					</div>
					<GeneratedDesignPicker
						locale={ locale }
						designs={ generatedDesigns }
						verticalId={ verticalId }
						onPreview={ onPreview }
					/>
					{ isShowAll && bottomAnchorContent }
				</div>
			) }
		</div>
	);
};

export { UnifiedDesignPicker as default, DesignPreviewImage };
