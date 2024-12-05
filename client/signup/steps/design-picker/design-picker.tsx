/* eslint-disable wpcalypso/jsx-classname-namespace */

import {
	BadgeContainer,
	isBlankCanvasDesign,
	getDesignPreviewUrl,
	getMShotOptions,
} from '@automattic/design-picker';
import { MShotsImage } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf, hasTranslation } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { noop } from 'lodash';
import { useMemo } from 'react';
import { DesignPickerCategoryFilter } from './design-picker-category-filter';
import { filterDesignsByCategory, sortDesigns } from './utils';
import type { Categorization } from './use-categorization';
import type { Design } from '@automattic/design-picker';
import type { FC, ReactNode } from 'react';
import './design-picker.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

const wasThemePurchased = ( purchasedThemes: string[] | undefined, design: Design ) =>
	purchasedThemes
		? purchasedThemes.some( ( themeId ) => design?.recipe?.stylesheet?.endsWith( '/' + themeId ) )
		: false;

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
	highRes: boolean;
}

const DesignPreviewImage: FC< DesignPreviewImageProps > = ( { design, locale, highRes } ) => {
	const scrollable = design.preview !== 'static';
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<MShotsImage
			url={ getDesignPreviewUrl( design, {
				language: locale,
				use_screenshot_overrides: true,
			} ) }
			aria-labelledby={ makeOptionId( design ) }
			alt=""
			options={ getMShotOptions( { scrollable, highRes, isMobile } ) }
			scrollable={ scrollable }
		/>
	);
};

interface DesignButtonProps {
	design: Design;
	locale: string;
	onSelect: ( design: Design ) => void;
	premiumBadge?: ReactNode;
	highRes: boolean;
	disabled?: boolean;
	hideFullScreenPreview?: boolean;
	hideDesignTitle?: boolean;
	hideDescription?: boolean;
	hideBadge?: boolean;
	hasDesignOptionHeader?: boolean;
	isPremiumThemeAvailable?: boolean;
	hasPurchasedTheme?: boolean;
	onCheckout?: any;
}

const DesignButton: FC< DesignButtonProps > = ( {
	locale,
	onSelect,
	design,
	highRes,
	disabled,
	hideDesignTitle,
	hideDescription,
	hideBadge,
	hasDesignOptionHeader = true,
	isPremiumThemeAvailable = false,
	hasPurchasedTheme = false,
	onCheckout = undefined,
} ) => {
	const { __ } = useI18n();

	const isBlankCanvas = isBlankCanvasDesign( design );

	const defaultTitle = design.title;
	const blankCanvasTitle = __( 'Blank Canvas' );
	const designTitle = isBlankCanvas ? blankCanvasTitle : defaultTitle;

	const isPremiumDesign = design?.design_tier !== 'free';

	const badgeType = isPremiumDesign ? 'premium' : 'none';

	const badgeContainer = (
		<BadgeContainer badgeType={ badgeType } isPremiumThemeAvailable={ isPremiumThemeAvailable } />
	);

	const shouldUpgrade = isPremiumDesign && ! isPremiumThemeAvailable && ! hasPurchasedTheme;

	function getPricingDescription() {
		if ( hideDescription ) {
			return null;
		}

		let text: React.ReactNode = null;

		if ( isPremiumDesign && shouldUpgrade ) {
			text = (
				<Button
					variant="link"
					className="design-picker__button-link"
					onClick={ ( e: any ) => {
						e.stopPropagation();
						onCheckout?.();
					} }
				>
					{ 'en' === locale || hasTranslation( 'Included in WordPress.com Premium' )
						? __( 'Included in WordPress.com Premium' )
						: __( 'Upgrade to Premium' ) }
				</Button>
			);
		} else if ( isPremiumDesign && ! shouldUpgrade && hasPurchasedTheme ) {
			text = __( 'Purchased on an annual subscription' );
		} else if ( isPremiumDesign && ! shouldUpgrade && ! hasPurchasedTheme ) {
			text = __( 'Included in your plan' );
		} else if ( ! isPremiumDesign ) {
			text = __( 'Free' );
		}

		return <div className="design-picker__pricing-description">{ text }</div>;
	}

	return (
		<button
			className="design-picker__design-option"
			disabled={ disabled }
			data-e2e-button={ isPremiumDesign ? 'paidOption' : 'freeOption' }
			onClick={ () => onSelect( design ) }
		>
			{ hasDesignOptionHeader && (
				<span className="design-picker__design-option-header">
					<svg width="28" height="6">
						<g>
							<rect width="6" height="6" rx="3" />
							<rect x="11" width="6" height="6" rx="3" />
							<rect x="22" width="6" height="6" rx="3" />
						</g>
					</svg>
				</span>
			) }
			<span
				className={ clsx(
					'design-picker__image-frame',
					'design-picker__image-frame-landscape',
					design.preview === 'static' ? 'design-picker__static' : 'design-picker__scrollable',
					{
						'design-picker__image-frame-blank': isBlankCanvas,
						'design-picker__image-frame-no-header': ! hasDesignOptionHeader,
					}
				) }
			>
				{ isBlankCanvas ? (
					<div className="design-picker__image-frame-blank-canvas__title">
						{ __( 'Start from scratch' ) }
					</div>
				) : (
					<div className="design-picker__image-frame-inside">
						<DesignPreviewImage design={ design } locale={ locale } highRes={ highRes } />
					</div>
				) }
			</span>
			<span className="design-picker__option-overlay">
				<span id={ makeOptionId( design ) } className="design-picker__option-meta">
					{ ! hideDesignTitle && (
						<span className="design-picker__option-name">{ designTitle }</span>
					) }
					{ ! hideBadge && badgeContainer }
				</span>
				{ getPricingDescription() }
			</span>
		</button>
	);
};

interface DesignButtonCoverProps {
	design: Design;
	isPremiumThemeAvailable?: boolean;
	onSelect: ( design: Design ) => void;
	onPreview: ( design: Design ) => void;
	onUpgrade?: ( design: Design ) => void;
}

const DesignButtonCover: FC< DesignButtonCoverProps > = ( {
	design,
	isPremiumThemeAvailable = false,
	onSelect,
	onPreview,
	onUpgrade,
} ) => {
	const { __ } = useI18n();
	const shouldUpgrade = design?.design_tier === 'premium' && ! isPremiumThemeAvailable;

	return (
		<div className="design-button-cover">
			{ /* Make all of design button clickable and default behavior is preview  */ }
			<button
				className="design-button-cover__button-overlay"
				tabIndex={ -1 }
				onClick={ () => onPreview( design ) }
			/>
			<div className="design-button-cover__button-groups">
				<Button
					className="design-button-cover__button"
					variant="primary"
					onClick={ () => ( shouldUpgrade ? onUpgrade?.( design ) : onSelect( design ) ) }
				>
					{ shouldUpgrade
						? __( 'Upgrade Plan' )
						: // translators: %s is the title of design with currency. Eg: Alves
						  sprintf( __( 'Start with %s' ), design.title ) }
				</Button>
				<Button className="design-button-cover__button" onClick={ () => onPreview( design ) }>
					{
						// translators: %s is the title of design with currency. Eg: Alves
						sprintf( __( 'Preview %s' ), design.title )
					}
				</Button>
			</div>
		</div>
	);
};

interface DesignButtonContainerProps extends DesignButtonProps {
	isPremiumThemeAvailable?: boolean;
	hasPurchasedTheme?: boolean;
	onPreview?: ( design: Design ) => void;
	onUpgrade?: () => void;
	previewOnly?: boolean;
}

const DesignButtonContainer: FC< DesignButtonContainerProps > = ( {
	isPremiumThemeAvailable,
	onPreview,
	onUpgrade,
	previewOnly = false,
	...props
} ) => {
	const isDesktop = useViewportMatch( 'large' );
	const isBlankCanvas = isBlankCanvasDesign( props.design );

	if ( ! onPreview || props.hideFullScreenPreview ) {
		return (
			<div className="design-button-container design-button-container--without-preview">
				<DesignButton { ...props } />
			</div>
		);
	}

	// Show the preview directly when selecting the design if the device is not desktop
	if ( ! isDesktop ) {
		return (
			<div className="design-button-container">
				<DesignButton { ...props } onSelect={ onPreview } />
			</div>
		);
	}

	// We don't need preview for blank canvas
	return (
		<div className="design-button-container">
			{ ! isBlankCanvas && ! previewOnly && (
				<DesignButtonCover
					design={ props.design }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					onSelect={ props.onSelect }
					onPreview={ onPreview }
					onUpgrade={ onUpgrade }
				/>
			) }
			<DesignButton
				{ ...props }
				isPremiumThemeAvailable={ isPremiumThemeAvailable }
				onSelect={ previewOnly ? onPreview : noop }
				disabled={ ! isBlankCanvas && ! previewOnly }
			/>
		</div>
	);
};

export interface DesignPickerProps {
	locale: string;
	onSelect: ( design: Design ) => void;
	onPreview?: ( design: Design ) => void;
	onUpgrade?: () => void;
	designs: Design[];
	premiumBadge?: ReactNode;
	isGridMinimal?: boolean;
	theme?: 'dark' | 'light';
	className?: string;
	highResThumbnails?: boolean;
	categorization?: Categorization;
	categoriesHeading?: ReactNode;
	anchorHeading?: ReactNode;
	categoriesFooter?: ReactNode;
	recommendedCategorySlug: string | null;
	hideFullScreenPreview?: boolean;
	hideDesignTitle?: boolean;
	hideDescription?: boolean;
	hideBadge?: boolean;
	isPremiumThemeAvailable?: boolean;
	previewOnly?: boolean;
	hasDesignOptionHeader?: boolean;
	onCheckout?: any;
	purchasedThemes?: string[];
}

const DesignPicker: FC< DesignPickerProps > = ( {
	locale,
	onSelect,
	onPreview,
	onUpgrade,
	designs,
	premiumBadge,
	isGridMinimal,
	theme = 'light',
	className,
	highResThumbnails = false,
	categoriesHeading,
	anchorHeading,
	categoriesFooter,
	categorization,
	hideFullScreenPreview,
	hideDesignTitle,
	hideDescription,
	hideBadge,
	recommendedCategorySlug,
	isPremiumThemeAvailable,
	previewOnly = false,
	hasDesignOptionHeader = true,
	onCheckout = undefined,
	purchasedThemes,
} ) => {
	const hasCategories = !! categorization?.categories.length;
	const filteredDesigns = useMemo( () => {
		const result = categorization?.selection
			? filterDesignsByCategory( designs, categorization.selection )
			: designs.slice(); // cloning because otherwise .sort() would mutate the original prop

		result.sort( sortDesigns );
		return result;
	}, [ designs, categorization?.selection ] );

	return (
		<div
			className={ clsx( 'design-picker', `design-picker--theme-${ theme }`, className, {
				'design-picker--has-categories': hasCategories,
			} ) }
		>
			{ anchorHeading }
			{ categorization && hasCategories && (
				<DesignPickerCategoryFilter
					categories={ categorization.categories }
					selectedCategory={ categorization.selection }
					recommendedCategorySlug={ recommendedCategorySlug }
					onSelect={ categorization.onSelect }
					heading={ categoriesHeading }
					footer={ categoriesFooter }
				/>
			) }
			<div className={ isGridMinimal ? 'design-picker__grid-minimal' : 'design-picker__grid' }>
				{ filteredDesigns.map( ( design ) => (
					<DesignButtonContainer
						key={ design.slug }
						design={ design }
						locale={ locale }
						onSelect={ onSelect }
						onPreview={ onPreview }
						onUpgrade={ onUpgrade }
						premiumBadge={ premiumBadge }
						highRes={ highResThumbnails }
						hideFullScreenPreview={ hideFullScreenPreview }
						hideDesignTitle={ hideDesignTitle }
						hideDescription={ hideDescription }
						hideBadge={ hideBadge }
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
						previewOnly={ previewOnly }
						hasDesignOptionHeader={ hasDesignOptionHeader }
						onCheckout={ onCheckout }
						hasPurchasedTheme={ wasThemePurchased( purchasedThemes, design ) }
					/>
				) ) }
			</div>
		</div>
	);
};

export default DesignPicker;
