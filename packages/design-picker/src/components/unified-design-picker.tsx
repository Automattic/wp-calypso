/* eslint-disable wpcalypso/jsx-classname-namespace */

import { isEnabled } from '@automattic/calypso-config';
import { MShotsImage } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, hasTranslation } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { noop } from 'lodash';
import { useMemo } from 'react';
import {
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
import StyleVariationBadges from './style-variation-badges';
import ThemePreview from './theme-preview';
import type { Categorization } from '../hooks/use-categorization';
import type { Design, StyleVariation } from '../types';
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
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<MShotsImage
			url={ getDesignPreviewUrl( design, {
				language: locale,
				vertical_id: design.verticalizable ? verticalId : undefined,
				use_screenshot_overrides: true,
			} ) }
			aria-labelledby={ makeOptionId( design ) }
			alt=""
			options={ getMShotOptions( { scrollable: true, highRes, isMobile } ) }
			scrollable={ true }
		/>
	);
};

interface DesignButtonProps {
	design: Design;
	locale: string;
	onSelect: ( design: Design, variation?: StyleVariation ) => void;
	highRes: boolean;
	disabled?: boolean;
	hideFullScreenPreview?: boolean;
	hideDesignTitle?: boolean;
	hasDesignOptionHeader?: boolean;
	isPremiumThemeAvailable?: boolean;
	hasPurchasedTheme?: boolean;
	onCheckout?: any;
	verticalId?: string;
}

const DesignButton: React.FC< DesignButtonProps > = ( {
	locale,
	onSelect,
	design,
	highRes,
	disabled,
	hideDesignTitle,
	hasDesignOptionHeader = true,
	isPremiumThemeAvailable = false,
	hasPurchasedTheme = false,
	onCheckout,
	verticalId,
} ) => {
	const { __ } = useI18n();
	const { style_variations = [], is_premium: isPremium = false } = design;
	const isEnableThemePreviewScreen = isEnabled( 'signup/theme-preview-screen' );
	const isEnableThemeStyleVariations =
		isEnabled( 'signup/design-picker-style-selection' ) && isEnableThemePreviewScreen;
	const shouldUpgrade = isPremium && ! isPremiumThemeAvailable && ! hasPurchasedTheme;

	function getPricingDescription() {
		if ( ! isEnableThemePreviewScreen ) {
			return null;
		}

		let text: React.ReactNode = null;
		if ( isPremium && shouldUpgrade ) {
			if ( isEnabled( 'signup/seller-upgrade-modal' ) ) {
				text = createInterpolateElement(
					sprintf(
						/* translators: %(price)s - the price of the theme */
						__( '%(price)s per year or <button>included in WordPress.com Premium</button>' ),
						{
							price: design.price,
						}
					),
					{
						button: (
							<Button
								isLink={ true }
								className="design-picker__button-link"
								onClick={ ( e: any ) => {
									e.stopPropagation();
									onCheckout?.();
								} }
							/>
						),
					}
				);
			} else {
				text = (
					<Button isLink={ true } className="design-picker__button-link">
						{ 'en' === locale || hasTranslation( 'Included in WordPress.com Premium' )
							? __( 'Included in WordPress.com Premium' )
							: __( 'Upgrade to Premium' ) }
					</Button>
				);
			}
		} else if ( isPremium && ! shouldUpgrade && hasPurchasedTheme ) {
			text = __( 'Purchased on an annual subscription' );
		} else if ( isPremium && ! shouldUpgrade && ! hasPurchasedTheme ) {
			text = __( 'Included in your plan' );
		} else if ( ! isPremium ) {
			text = __( 'Free' );
		}

		return (
			<div className="design-picker__pricing-description">
				{ isPremium && (
					<PremiumBadge
						tooltipPosition="bottom right"
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
					/>
				) }
				<span>{ text }</span>
			</div>
		);
	}

	return (
		<div className="design-picker__design-option">
			<button
				disabled={ disabled }
				data-e2e-button={ isPremium ? 'paidOption' : 'freeOption' }
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
						'design-picker__scrollable',
						{
							'design-picker__image-frame-no-header': ! hasDesignOptionHeader,
						}
					) }
				>
					<div className="design-picker__image-frame-inside">
						<DesignPreviewImage
							design={ design }
							locale={ locale }
							highRes={ highRes }
							verticalId={ verticalId }
						/>
					</div>
				</span>
				<span className="design-picker__option-overlay">
					<span id={ makeOptionId( design ) } className="design-picker__option-meta">
						{ ! hideDesignTitle && (
							<span className="design-picker__option-name">{ design.title }</span>
						) }
						{ ! isEnableThemePreviewScreen && isPremium && (
							<PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } />
						) }
						{ isEnableThemeStyleVariations && style_variations.length > 0 && (
							<div className="design-picker__options-style-variations">
								<StyleVariationBadges
									variations={ style_variations }
									onClick={ ( variation ) => onSelect( design, variation ) }
								/>
							</div>
						) }
					</span>
				</span>
				{ getPricingDescription() }
			</button>
		</div>
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
	hasPurchasedTheme?: boolean;
	onPreview?: ( design: Design, variation?: StyleVariation ) => void;
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

	if ( isBlankCanvas ) {
		return <PatternAssemblerCta onButtonClick={ () => props.onSelect( props.design ) } />;
	}

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
				<DesignButton
					{ ...props }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					onSelect={ onPreview }
				/>
			</div>
		);
	}

	return (
		<div className="design-button-container">
			{ ! previewOnly && (
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
				disabled={ ! previewOnly }
			/>
		</div>
	);
};

const wasThemePurchased = ( purchasedThemes: string[] | undefined, design: Design ) =>
	purchasedThemes
		? purchasedThemes.some( ( themeId ) => design?.recipe?.stylesheet?.endsWith( '/' + themeId ) )
		: false;

export interface UnifiedDesignPickerProps {
	locale: string;
	verticalId?: string;
	onSelect: ( design: Design ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onUpgrade?: () => void;
	generatedDesigns: Design[];
	staticDesigns: Design[];
	categorization?: Categorization;
	heading?: React.ReactNode;
	isPremiumThemeAvailable?: boolean;
	previewOnly?: boolean;
	hasDesignOptionHeader?: boolean;
	onCheckout?: any;
	purchasedThemes?: string[];
}

interface StaticDesignPickerProps {
	locale: string;
	verticalId?: string;
	onSelect: ( design: Design ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	onUpgrade?: () => void;
	designs: Design[];
	categorization?: Categorization;
	isPremiumThemeAvailable?: boolean;
	previewOnly?: boolean;
	hasDesignOptionHeader?: boolean;
	onCheckout?: any;
	purchasedThemes?: string[];
}

interface GeneratedDesignPickerProps {
	locale: string;
	designs: Design[];
	verticalId?: string;
	onPreview: ( design: Design ) => void;
}

const StaticDesignPicker: React.FC< StaticDesignPickerProps > = ( {
	locale,
	onSelect,
	onPreview,
	onUpgrade,
	designs,
	categorization,
	previewOnly = false,
	hasDesignOptionHeader = true,
	isPremiumThemeAvailable,
	onCheckout,
	verticalId,
	purchasedThemes,
} ) => {
	const hasCategories = !! categorization?.categories.length;

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
			<div className={ 'design-picker__grid' }>
				{ filteredDesigns.map( ( design ) => (
					<DesignButtonContainer
						key={ design.slug }
						design={ design }
						locale={ locale }
						onSelect={ onSelect }
						onPreview={ onPreview }
						onUpgrade={ onUpgrade }
						highRes={ false }
						hideFullScreenPreview={ false }
						hideDesignTitle={ false }
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
						previewOnly={ previewOnly }
						hasDesignOptionHeader={ hasDesignOptionHeader }
						onCheckout={ onCheckout }
						verticalId={ verticalId }
						hasPurchasedTheme={ wasThemePurchased( purchasedThemes, design ) }
					/>
				) ) }
			</div>
		</div>
	);
};

const GeneratedDesignPicker: React.FC< GeneratedDesignPickerProps > = ( {
	locale,
	designs,
	verticalId,
	onPreview,
} ) => {
	const isMobile = useViewportMatch( 'small', '<' );

	return (
		<div className="design-picker__grid">
			{ designs.map( ( design ) => {
				const previewUrl = getDesignPreviewUrl( design, {
					language: locale,
					vertical_id: verticalId,
					viewport_width: isMobile ? MOBILE_VIEWPORT_WIDTH : DEFAULT_VIEWPORT_WIDTH,
					viewport_height: DEFAULT_VIEWPORT_HEIGHT,
					use_screenshot_overrides: true,
				} );
				return (
					<div className="design-button-container" key={ `generated-design__${ design.slug }` }>
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
			} ) }
		</div>
	);
};

const UnifiedDesignPicker: React.FC< UnifiedDesignPickerProps > = ( {
	locale,
	onSelect,
	onPreview,
	onUpgrade,
	verticalId,
	staticDesigns,
	generatedDesigns,
	heading,
	categorization,
	previewOnly = false,
	hasDesignOptionHeader = true,
	isPremiumThemeAvailable,
	onCheckout,
	purchasedThemes,
} ) => {
	const hasCategories = !! categorization?.categories.length;
	const translate = useTranslate();
	const hasGeneratedDesigns = generatedDesigns.length > 0;

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
			{ hasGeneratedDesigns && (
				<div className="unified-design-picker__generated-designs">
					<div>
						<h3> { translate( 'Custom designs for your site' ) } </h3>
						<p className="unified-design-picker__subtitle">
							{ translate( 'Based on your input, these designs have been tailored for you.' ) }
						</p>
					</div>
					<GeneratedDesignPicker
						locale={ locale }
						designs={ generatedDesigns }
						onPreview={ onPreview }
						verticalId={ verticalId }
					/>
				</div>
			) }
			<div className="unified-design-picker__standard-designs">
				{ hasGeneratedDesigns && (
					<div>
						<h3> { translate( 'Selected themes for you' ) } </h3>
						<p className="unified-design-picker__subtitle">
							{ translate( 'Choose a starting theme. You can change it later.' ) }
						</p>
					</div>
				) }
				<StaticDesignPicker
					locale={ locale }
					onSelect={ onSelect }
					onPreview={ onPreview }
					onUpgrade={ onUpgrade }
					designs={ staticDesigns }
					categorization={ categorization }
					verticalId={ verticalId }
					previewOnly={ previewOnly }
					hasDesignOptionHeader={ hasDesignOptionHeader }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					onCheckout={ onCheckout }
					purchasedThemes={ purchasedThemes }
				/>
			</div>
		</div>
	);
};

export { UnifiedDesignPicker as default, DesignPreviewImage };
