/* eslint-disable wpcalypso/jsx-classname-namespace */

import { isEnabled } from '@automattic/calypso-config';
import { MShotsImage } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf, hasTranslation } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { noop } from 'lodash';
import { useMemo } from 'react';
import {
	getAvailableDesigns,
	getDesignPreviewUrl,
	getMShotOptions,
	isBlankCanvasDesign,
	filterDesignsByCategory,
	sortDesigns,
	excludeFseDesigns,
} from '../utils';
import BadgeContainer from './badge-container';
import { DesignPickerCategoryFilter } from './design-picker-category-filter';
import type { Categorization } from '../hooks/use-categorization';
import type { Design } from '../types';
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
	highRes: boolean;
	verticalId?: string;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( {
	design,
	locale,
	highRes,
	verticalId,
} ) => {
	const scrollable = design.preview !== 'static';
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<MShotsImage
			url={ getDesignPreviewUrl( design, {
				language: locale,
				vertical_id: verticalId,
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
	premiumBadge?: React.ReactNode;
	highRes: boolean;
	disabled?: boolean;
	hideFullScreenPreview?: boolean;
	hideDesignTitle?: boolean;
	hideDescription?: boolean;
	hideBadge?: boolean;
	hasDesignOptionHeader?: boolean;
	isPremiumThemeAvailable?: boolean;
	onCheckout?: any;
	verticalId?: string;
}

const DesignButton: React.FC< DesignButtonProps > = ( {
	locale,
	onSelect,
	design,
	premiumBadge = null,
	highRes,
	disabled,
	hideDesignTitle,
	hideDescription,
	hideBadge,
	hasDesignOptionHeader = true,
	isPremiumThemeAvailable = false,
	onCheckout = undefined,
	verticalId,
} ) => {
	const { __ } = useI18n();

	const isBlankCanvas = isBlankCanvasDesign( design );

	const defaultTitle = design.title;
	const blankCanvasTitle = __( 'Blank Canvas', __i18n_text_domain__ );
	const designTitle = isBlankCanvas ? blankCanvasTitle : defaultTitle;

	const badgeType = design.is_premium ? 'premium' : 'none';

	const badgeContainer = ! isEnabled( 'signup/theme-preview-screen' ) ? (
		design.is_premium && premiumBadge
	) : (
		<BadgeContainer badgeType={ badgeType } isPremiumThemeAvailable={ isPremiumThemeAvailable } />
	);

	const shouldUpgrade = design.is_premium && ! isPremiumThemeAvailable;

	function getPricingDescription() {
		if ( ! isEnabled( 'signup/theme-preview-screen' ) ) {
			return null;
		}

		if ( hideDescription ) {
			return null;
		}

		let text: any = __( 'Free' );

		if ( design.is_premium ) {
			text = shouldUpgrade ? (
				<Button
					isLink={ true }
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
			) : (
				__( 'Included in your plan' )
			);
		}

		return <div className="design-picker__pricing-description">{ text }</div>;
	}

	return (
		<button
			className="design-picker__design-option"
			disabled={ disabled }
			data-e2e-button={ design.is_premium ? 'paidOption' : 'freeOption' }
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
				className={ classnames(
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
						{ __( 'Start from scratch', __i18n_text_domain__ ) }
					</div>
				) : (
					<div className="design-picker__image-frame-inside">
						<DesignPreviewImage
							design={ design }
							locale={ locale }
							highRes={ highRes }
							verticalId={ verticalId }
						/>
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

const DesignButtonCover: React.FC< DesignButtonCoverProps > = ( {
	design,
	isPremiumThemeAvailable = false,
	onSelect,
	onPreview,
	onUpgrade,
} ) => {
	const { __ } = useI18n();
	const shouldUpgrade = design.is_premium && ! isPremiumThemeAvailable;

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
					isPrimary
					onClick={ () => ( shouldUpgrade ? onUpgrade?.( design ) : onSelect( design ) ) }
				>
					{ shouldUpgrade
						? __( 'Upgrade Plan', __i18n_text_domain__ )
						: // translators: %s is the title of design with currency. Eg: Alves
						  sprintf( __( 'Start with %s', __i18n_text_domain__ ), design.title ) }
				</Button>
				<Button className="design-button-cover__button" onClick={ () => onPreview( design ) }>
					{
						// translators: %s is the title of design with currency. Eg: Alves
						sprintf( __( 'Preview %s', __i18n_text_domain__ ), design.title )
					}
				</Button>
			</div>
		</div>
	);
};

interface DesignButtonContainerProps extends DesignButtonProps {
	isPremiumThemeAvailable?: boolean;
	onPreview?: ( design: Design ) => void;
	onUpgrade?: () => void;
	previewOnly?: boolean;
}

const DesignButtonContainer: React.FC< DesignButtonContainerProps > = ( {
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
	designs?: Design[];
	premiumBadge?: React.ReactNode;
	isGridMinimal?: boolean;
	theme?: 'dark' | 'light';
	className?: string;
	highResThumbnails?: boolean;
	categorization?: Categorization;
	categoriesHeading?: React.ReactNode;
	anchorHeading?: React.ReactNode;
	categoriesFooter?: React.ReactNode;
	recommendedCategorySlug: string | null;
	hideFullScreenPreview?: boolean;
	hideDesignTitle?: boolean;
	hideDescription?: boolean;
	hideBadge?: boolean;
	isPremiumThemeAvailable?: boolean;
	previewOnly?: boolean;
	hasDesignOptionHeader?: boolean;
	onCheckout?: any;
	verticalId?: string;
}
const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onSelect,
	onPreview,
	onUpgrade,
	designs = getAvailableDesigns( {
		featuredDesignsFilter: ( design ) =>
			! design.features.includes( 'anchorfm' ) && excludeFseDesigns( design ),
	} ).featured,
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
	verticalId,
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
			className={ classnames( 'design-picker', `design-picker--theme-${ theme }`, className, {
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
						verticalId={ verticalId }
					/>
				) ) }
			</div>
		</div>
	);
};

export { DesignPicker as default, DesignPreviewImage };
