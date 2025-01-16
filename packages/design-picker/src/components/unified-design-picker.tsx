import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import { InView } from 'react-intersection-observer';
import { SHOW_ALL_SLUG } from '../constants';
import { useDesignTiers, useDesignPickerFilters } from '../hooks/use-design-picker-filters';
import { useFilteredDesignsByGroup } from '../hooks/use-filtered-designs';
import {
	isDefaultGlobalStylesVariationSlug,
	isFeatureCategory,
	isLockedStyleVariation,
} from '../utils';
import DesignPickerCategoryFilter from './design-picker-category-filter';
import DesignPreviewImage from './design-preview-image';
import NoResults from './no-results';
import ThemeCard from './theme-card';
import type { Categorization } from '../hooks/use-categorization';
import type { Design, StyleVariation } from '../types';
import type { RefCallback } from 'react';
import './style.scss';

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
					...( design?.design_tier && { design_tier: design.design_tier } ),
					is_premium: design?.design_tier === 'premium',
					// TODO: Better to track whether already available on this sites plan.
					is_premium_available: isPremiumThemeAvailable,
					slug: design.slug,
					is_virtual: design.is_virtual,
					is_externally_managed: design?.design_tier === 'partner',
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
	getBadge?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
	getOptionsMenu?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
	oldHighResImageLoading?: boolean; // Temporary for A/B test.
	isActive: boolean;
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
	getOptionsMenu,
	oldHighResImageLoading,
	isActive,
} ) => {
	const [ selectedStyleVariation, setSelectedStyleVariation ] = useState< StyleVariation >();

	const { style_variations = [] } = design;
	const trackingDivRef = useTrackDesignView( { category, design, isPremiumThemeAvailable } );
	const isDefaultVariation = isDefaultGlobalStylesVariationSlug( selectedStyleVariation?.slug );

	const isLocked = isLockedStyleVariation( {
		isPremiumTheme: design?.design_tier === 'premium',
		styleVariationSlug: selectedStyleVariation?.slug,
		shouldLimitGlobalStyles,
	} );

	const conditionalProps =
		! isLocked && isActive
			? {}
			: { onImageClick: () => onPreview( design, selectedStyleVariation ) };

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
					oldHighResImageLoading={ oldHighResImageLoading }
				/>
			}
			optionsMenu={ getOptionsMenu && getOptionsMenu( design.slug, isLocked ) }
			badge={ getBadge && getBadge( design.slug, isLocked ) }
			styleVariations={ style_variations }
			selectedStyleVariation={ selectedStyleVariation }
			onStyleVariationClick={ ( variation ) => {
				onChangeVariation( design, variation );
				setSelectedStyleVariation( variation );
			} }
			onStyleVariationMoreClick={ () => onPreview( design ) }
			isActive={ isActive && ! isLocked }
			{ ...conditionalProps }
		/>
	);
};

interface DesignCardGroup {
	title?: string | React.ReactNode;
	designs: Design[];
	locale: string;
	category?: string | null;
	categoryName?: string;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	oldHighResImageLoading?: boolean; // Temporary for A/B test.
	showActiveThemeBadge?: boolean;
	siteActiveTheme?: string | null;
	showNoResults?: boolean;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	getBadge?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
	getOptionsMenu?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
}

const DesignCardGroup = ( {
	title,
	designs,
	category,
	categoryName,
	locale,
	isPremiumThemeAvailable,
	shouldLimitGlobalStyles,
	oldHighResImageLoading,
	showActiveThemeBadge = false,
	siteActiveTheme,
	showNoResults,
	onChangeVariation,
	onPreview,
	getBadge,
	getOptionsMenu,
}: DesignCardGroup ) => {
	const translate = useTranslate();
	const [ isCollapsed, setIsCollapsed ] = useState( !! categoryName || false );
	const collapsedDesignCount = 6;
	const visibleDesigns = isCollapsed ? designs.slice( 0, collapsedDesignCount ) : designs;

	const content = (
		<div className="design-picker__grid">
			{ visibleDesigns.map( ( design, index ) => {
				return (
					<DesignCard
						key={ design.recipe?.slug ?? design.slug ?? index }
						category={ category }
						design={ design }
						locale={ locale }
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
						shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
						onChangeVariation={ onChangeVariation }
						onPreview={ onPreview }
						getBadge={ getBadge }
						getOptionsMenu={ getOptionsMenu }
						oldHighResImageLoading={ oldHighResImageLoading }
						isActive={
							showActiveThemeBadge &&
							design.recipe?.stylesheet === siteActiveTheme &&
							! design.is_virtual
						}
					/>
				);
			} ) }
			{ showNoResults && designs.length === 0 && <NoResults /> }
		</div>
	);

	if ( ! showNoResults && designs.length === 0 ) {
		return null;
	}

	return (
		<div className="design-picker__design-card-group">
			{ title && designs.length > 0 && (
				<div className="design-picker__design-card-title">
					{ title } ({ designs.length })
				</div>
			) }
			{ content }
			{ isCollapsed && designs.length > collapsedDesignCount && (
				<div className="design-picker__design-card-group-footer">
					<Button onClick={ () => setIsCollapsed( false ) }>
						{ translate( 'Show all %s themes', {
							args: categoryName,
							comment: '%s will be a name of the theme category. e.g. Blog.',
						} ) }
					</Button>
				</div>
			) }
		</div>
	);
};

interface DesignPickerFilterGroupProps {
	title?: string;
	grow?: boolean;
	isBigSkyEligible?: boolean;
	children: React.ReactNode;
}

const DesignPickerFilterGroup: React.FC< DesignPickerFilterGroupProps > = ( {
	title,
	grow,
	isBigSkyEligible,
	children,
} ) => {
	return (
		<div
			className={ clsx( 'design-picker__category-group', {
				// eslint-disable-next-line eqeqeq
				'design-picker__category-group--flex': grow && ! isBigSkyEligible,
				'design-picker__category-group--grow': isBigSkyEligible,
			} ) }
		>
			<div className="design-picker__category-group-label">{ title }</div>
			<div className="design-picker__category-group-content">{ children }</div>
		</div>
	);
};

interface DesignPickerProps {
	locale: string;
	onDesignWithAI?: () => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	designs: Design[];
	categorization?: Categorization;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	getBadge?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
	getOptionsMenu?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
	oldHighResImageLoading?: boolean; // Temporary for A/B test
	siteActiveTheme?: string | null;
	showActiveThemeBadge?: boolean;
	isMultiFilterEnabled?: boolean;
	isBigSkyEligible?: boolean;
}

const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onDesignWithAI,
	onPreview,
	onChangeVariation,
	designs,
	categorization,
	isPremiumThemeAvailable,
	shouldLimitGlobalStyles,
	getBadge,
	getOptionsMenu,
	oldHighResImageLoading,
	siteActiveTheme = null,
	showActiveThemeBadge = false,
	isMultiFilterEnabled = false,
	isBigSkyEligible = false,
} ) => {
	const translate = useTranslate();
	const { selectedCategoriesWithoutDesignTier } = useDesignPickerFilters();

	const categories = categorization?.categories || [];

	const tierFilters = useDesignTiers();

	const categoryTypes = useMemo(
		() => [ ...categories.filter( ( { slug } ) => isFeatureCategory( slug ) ), ...tierFilters ],
		[ categorization?.categories, tierFilters ]
	);

	const categoryTopics = useMemo(
		() => categories.filter( ( { slug } ) => ! isFeatureCategory( slug ) ),
		[ categorization?.categories ]
	);

	const { all, best, ...designsByGroup } = useFilteredDesignsByGroup( designs );

	// Show no results only when no design matches the selected categories and tiers.
	const showNoResults = Object.values( designsByGroup ).every(
		( categoryDesigns ) => categoryDesigns.length === 0
	);

	const getCategoryName = ( value: string ) =>
		categories.find( ( { slug } ) => slug === value )?.name || '';

	const designCardProps = {
		locale,
		isPremiumThemeAvailable,
		shouldLimitGlobalStyles,
		onChangeVariation,
		onPreview,
		getBadge,
		getOptionsMenu,
		oldHighResImageLoading,
		showActiveThemeBadge,
		siteActiveTheme,
	};

	return (
		<div>
			<div className="design-picker__filters">
				{ categorization && categoryTypes.length && isMultiFilterEnabled && (
					<DesignPickerFilterGroup title={ translate( 'Type' ) }>
						<DesignPickerCategoryFilter
							categories={ categoryTypes }
							onSelect={ categorization.onSelect }
							selectedSlugs={ categorization.selections }
							isMultiSelection={ isMultiFilterEnabled }
							forceSwipe
						/>
					</DesignPickerFilterGroup>
				) }
				{ categorization && categoryTopics.length && (
					<DesignPickerFilterGroup
						title={ isMultiFilterEnabled ? translate( 'Topic' ) : '' }
						grow={ ! isBigSkyEligible }
						isBigSkyEligible={ isBigSkyEligible }
					>
						<DesignPickerCategoryFilter
							categories={ isMultiFilterEnabled ? categoryTopics : categorization.categories }
							onSelect={ categorization.onSelect }
							selectedSlugs={ categorization.selections }
							isMultiSelection={ isMultiFilterEnabled }
						/>
					</DesignPickerFilterGroup>
				) }
				{ isBigSkyEligible && (
					<DesignPickerFilterGroup>
						<Button
							className={ clsx(
								'design-picker__design-your-own-button',
								'design-picker__design-with-ai'
							) }
							onClick={ () => {
								onDesignWithAI && onDesignWithAI();
							} }
						>
							{ translate( 'Design with AI' ) }
						</Button>
					</DesignPickerFilterGroup>
				) }
			</div>

			{ isMultiFilterEnabled && selectedCategoriesWithoutDesignTier.length > 1 && (
				<DesignCardGroup
					{ ...designCardProps }
					title={ translate( 'Best matching themes' ) }
					category="best"
					designs={ best }
				/>
			) }

			{ isMultiFilterEnabled && selectedCategoriesWithoutDesignTier.length === 0 && (
				<DesignCardGroup { ...designCardProps } designs={ all } />
			) }

			{ /* We want to show the last one on top first. */ }
			{ Object.entries( designsByGroup )
				.reverse()
				.map( ( [ categorySlug, categoryDesigns ], index, array ) => (
					<DesignCardGroup
						key={ categorySlug }
						{ ...designCardProps }
						title={
							isMultiFilterEnabled
								? translate( '%s themes', {
										args: getCategoryName( categorySlug ),
										comment: '%s will be a name of the theme category. e.g. Blog.',
								  } )
								: ''
						}
						category={ categorySlug }
						categoryName={ isMultiFilterEnabled ? getCategoryName( categorySlug ) : '' }
						designs={ categoryDesigns }
						showNoResults={ index === array.length - 1 && showNoResults }
					/>
				) ) }
		</div>
	);
};

export interface UnifiedDesignPickerProps {
	locale: string;
	onDesignWithAI?: () => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onChangeVariation: ( design: Design, variation?: StyleVariation ) => void;
	onViewAllDesigns: () => void;
	designs: Design[];
	categorization?: Categorization;
	heading?: React.ReactNode;
	isPremiumThemeAvailable?: boolean;
	shouldLimitGlobalStyles?: boolean;
	getBadge?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
	getOptionsMenu?: ( themeId: string, isLockedStyleVariation: boolean ) => React.ReactNode;
	oldHighResImageLoading?: boolean; // Temporary for A/B test
	siteActiveTheme?: string | null;
	showActiveThemeBadge?: boolean;
	isMultiFilterEnabled?: boolean;
	isBigSkyEligible?: boolean;
}

const UnifiedDesignPicker: React.FC< UnifiedDesignPickerProps > = ( {
	locale,
	onDesignWithAI,
	onPreview,
	onChangeVariation,
	onViewAllDesigns,
	designs,
	heading,
	categorization,
	isPremiumThemeAvailable,
	shouldLimitGlobalStyles,
	getBadge,
	getOptionsMenu,
	oldHighResImageLoading,
	siteActiveTheme = null,
	showActiveThemeBadge = false,
	isMultiFilterEnabled = false,
	isBigSkyEligible = false,
} ) => {
	const hasCategories = !! ( categorization?.categories || [] ).length;

	return (
		<div
			className={ clsx( 'design-picker', `design-picker--theme-light`, 'design-picker__unified', {
				'design-picker--has-categories': hasCategories,
			} ) }
		>
			{ heading }
			<div className="unified-design-picker__designs">
				<DesignPicker
					locale={ locale }
					onDesignWithAI={ onDesignWithAI }
					onPreview={ onPreview }
					onChangeVariation={ onChangeVariation }
					designs={ designs }
					categorization={ categorization }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
					getBadge={ getBadge }
					getOptionsMenu={ getOptionsMenu }
					oldHighResImageLoading={ oldHighResImageLoading }
					siteActiveTheme={ siteActiveTheme }
					showActiveThemeBadge={ showActiveThemeBadge }
					isMultiFilterEnabled={ isMultiFilterEnabled }
					isBigSkyEligible={ isBigSkyEligible }
				/>
				<InView onChange={ ( inView ) => inView && onViewAllDesigns() } />
			</div>
		</div>
	);
};

export { UnifiedDesignPicker as default };
