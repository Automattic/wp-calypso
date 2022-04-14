/* eslint-disable wpcalypso/jsx-classname-namespace */

import { MShotsImage } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useMemo } from 'react';
import {
	getAvailableDesigns,
	getDesignPreviewUrl,
	mShotOptions,
	isBlankCanvasDesign,
	filterDesignsByCategory,
	sortDesigns,
	excludeFseDesigns,
} from '../utils';
import { DesignPickerCategoryFilter } from './design-picker-category-filter';
import type { Categorization } from '../hooks/use-categorization';
import type { Design } from '../types';
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
	highRes: boolean;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( { design, locale, highRes } ) => (
	<MShotsImage
		url={ getDesignPreviewUrl( design, { language: locale } ) }
		aria-labelledby={ makeOptionId( design ) }
		alt=""
		options={ mShotOptions( design, highRes ) }
		scrollable={ design.preview !== 'static' }
	/>
);

interface DesignButtonProps {
	design: Design;
	locale: string;
	onSelect: ( design: Design ) => void;
	premiumBadge?: React.ReactNode;
	highRes: boolean;
	disabled?: boolean;
	hideFullScreenPreview?: boolean;
	hideDesignTitle?: boolean;
}

const DesignButton: React.FC< DesignButtonProps > = ( {
	locale,
	onSelect,
	design,
	premiumBadge = null,
	highRes,
	disabled,
	hideDesignTitle,
} ) => {
	const { __ } = useI18n();

	const isBlankCanvas = isBlankCanvasDesign( design );

	const defaultTitle = design.title;
	const blankCanvasTitle = __( 'Blank Canvas', __i18n_text_domain__ );
	const designTitle = isBlankCanvas ? blankCanvasTitle : defaultTitle;

	return (
		<button
			className="design-picker__design-option"
			disabled={ disabled }
			data-e2e-button={ design.is_premium ? 'paidOption' : 'freeOption' }
			onClick={ () => onSelect( design ) }
		>
			<span className="design-picker__design-option-header">
				<svg width="28" height="6">
					<g>
						<rect width="6" height="6" rx="3" />
						<rect x="11" width="6" height="6" rx="3" />
						<rect x="22" width="6" height="6" rx="3" />
					</g>
				</svg>
			</span>
			<span
				className={ classnames(
					'design-picker__image-frame',
					'design-picker__image-frame-landscape',
					design.preview === 'static' ? 'design-picker__static' : 'design-picker__scrollable',
					{ 'design-picker__image-frame-blank': isBlankCanvas }
				) }
			>
				{ isBlankCanvas ? (
					<div className="design-picker__image-frame-blank-canvas__title">
						{ __( 'Start from scratch', __i18n_text_domain__ ) }
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
					{ design.is_premium && premiumBadge }
				</span>
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
}

const DesignButtonContainer: React.FC< DesignButtonContainerProps > = ( {
	isPremiumThemeAvailable,
	onPreview,
	onUpgrade,
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
			{ ! isBlankCanvas && (
				<DesignButtonCover
					design={ props.design }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					onSelect={ props.onSelect }
					onPreview={ onPreview }
					onUpgrade={ onUpgrade }
				/>
			) }
			<DesignButton { ...props } disabled={ ! isBlankCanvas } />
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
	categoriesFooter?: React.ReactNode;
	recommendedCategorySlug: string | null;
	hideFullScreenPreview?: boolean;
	hideDesignTitle?: boolean;
	isPremiumThemeAvailable?: boolean;
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
	categoriesFooter,
	categorization,
	hideFullScreenPreview,
	hideDesignTitle,
	recommendedCategorySlug,
	isPremiumThemeAvailable,
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
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
					/>
				) ) }
			</div>
		</div>
	);
};

export default DesignPicker;
