/* eslint-disable wpcalypso/jsx-classname-namespace */

import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_WOOP } from '@automattic/calypso-products';
import { MShotsImage } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, hasTranslation } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
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
import StyleVariationBadges from './style-variation-badges';
import ThemePreview from './theme-preview';
import WooCommerceBundledBadge from './woocommerce-bundled-badge';
import type { Categorization } from '../hooks/use-categorization';
import type { Design, StyleVariation } from '../types';
import './style.scss';

const makeOptionId = ( { slug }: Design ): string => `design-picker__option-name__${ slug }`;

interface DesignPreviewImageProps {
	design: Design;
	locale: string;
	verticalId?: string;
}

const DesignPreviewImage: React.FC< DesignPreviewImageProps > = ( {
	design,
	locale,
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
			options={ getMShotOptions( { scrollable: true, highRes: false, isMobile } ) }
			scrollable={ true }
		/>
	);
};

interface DesignButtonProps {
	design: Design;
	locale: string;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	isPremiumThemeAvailable?: boolean;
	hasPurchasedTheme?: boolean;
	onCheckout?: any;
	verticalId?: string;
	currentPlanFeatures?: string[];
}

const DesignButton: React.FC< DesignButtonProps > = ( {
	locale,
	onPreview,
	design,
	isPremiumThemeAvailable = false,
	hasPurchasedTheme = false,
	onCheckout,
	verticalId,
	currentPlanFeatures,
} ) => {
	const { __ } = useI18n();
	const { style_variations = [], is_premium: isPremium = false } = design;
	const shouldUpgrade = isPremium && ! isPremiumThemeAvailable && ! hasPurchasedTheme;
	const currentSiteCanInstallWoo = currentPlanFeatures?.includes( FEATURE_WOOP ) ?? false;

	const designIsBundledWithWoo =
		isEnabled( 'themes/plugin-bundling' ) && design.is_bundled_with_woo_commerce;

	function getPricingDescription() {
		let text: React.ReactNode = null;

		if ( designIsBundledWithWoo ) {
			text = currentSiteCanInstallWoo
				? __( 'Included in your plan' )
				: __( 'Available with WordPress.com Business' );
		} else if ( isPremium && shouldUpgrade ) {
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

		let badge: React.ReactNode = null;
		if ( designIsBundledWithWoo ) {
			badge = <WooCommerceBundledBadge />;
		} else if ( isPremium ) {
			badge = (
				<PremiumBadge
					tooltipPosition="bottom right"
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
				/>
			);
		}

		return (
			<div className="design-picker__pricing-description design-picker__override-premium-badge">
				{ badge }
				<span>{ text }</span>
			</div>
		);
	}

	return (
		<div className="design-picker__design-option">
			<button
				data-e2e-button={ isPremium ? 'paidOption' : 'freeOption' }
				onClick={ () => onPreview( design ) }
			>
				<span
					className={ classnames(
						'design-picker__image-frame',
						'design-picker__image-frame-landscape',
						'design-picker__scrollable',
						'design-picker__image-frame-no-header'
					) }
				>
					<div className="design-picker__image-frame-inside">
						<DesignPreviewImage design={ design } locale={ locale } verticalId={ verticalId } />
					</div>
				</span>
				<span className="design-picker__option-overlay">
					<span id={ makeOptionId( design ) } className="design-picker__option-meta">
						<span className="design-picker__option-name">{ design.title }</span>
						{ style_variations.length > 0 && (
							<div className="design-picker__options-style-variations">
								<StyleVariationBadges
									variations={ style_variations }
									onClick={ ( variation ) => onPreview( design, variation ) }
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

interface DesignButtonContainerProps extends DesignButtonProps {
	onSelect: ( design: Design ) => void;
}

const DesignButtonContainer: React.FC< DesignButtonContainerProps > = ( {
	onSelect,
	...props
} ) => {
	const isBlankCanvas = isBlankCanvasDesign( props.design );
	if ( isBlankCanvas ) {
		return <PatternAssemblerCta onButtonClick={ () => onSelect( props.design ) } />;
	}

	return (
		<div className="design-button-container">
			<DesignButton { ...props } />
		</div>
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

	return (
		<div
			key={ `generated-design__${ design.slug }` }
			className={ classnames( 'design-button-container', 'design-button-container--is-generated', {
				'design-button-container--is-generated--is-showing': isShowing,
			} ) }
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
	onSelect: ( design: Design ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	staticDesigns: Design[];
	generatedDesigns: Design[];
	categorization?: Categorization;
	isPremiumThemeAvailable?: boolean;
	onCheckout?: any;
	purchasedThemes?: string[];
	currentPlanFeatures?: string[];
}

const DesignPicker: React.FC< DesignPickerProps > = ( {
	locale,
	onSelect,
	onPreview,
	staticDesigns,
	generatedDesigns,
	categorization,
	isPremiumThemeAvailable,
	onCheckout,
	verticalId,
	purchasedThemes,
	currentPlanFeatures,
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
				{ filteredStaticDesigns.map( ( design ) => (
					<DesignButtonContainer
						key={ design.slug }
						design={ design }
						locale={ locale }
						onSelect={ onSelect }
						onPreview={ onPreview }
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
						onCheckout={ onCheckout }
						verticalId={ verticalId }
						hasPurchasedTheme={ wasThemePurchased( purchasedThemes, design ) }
						currentPlanFeatures={ currentPlanFeatures }
					/>
				) ) }
				{ generatedDesigns.map( ( design ) => (
					<GeneratedDesignButtonContainer
						key={ `generated-design__${ design.slug }` }
						design={ design }
						locale={ locale }
						verticalId={ verticalId }
						isShowing={ categorization?.selection === SHOW_GENERATED_DESIGNS_SLUG }
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
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	generatedDesigns: Design[];
	staticDesigns: Design[];
	categorization?: Categorization;
	heading?: React.ReactNode;
	isPremiumThemeAvailable?: boolean;
	onCheckout?: any;
	purchasedThemes?: string[];
	currentPlanFeatures?: string[];
}

const UnifiedDesignPicker: React.FC< UnifiedDesignPickerProps > = ( {
	locale,
	onSelect,
	onPreview,
	verticalId,
	staticDesigns,
	generatedDesigns,
	heading,
	categorization,
	isPremiumThemeAvailable,
	onCheckout,
	purchasedThemes,
	currentPlanFeatures,
} ) => {
	const translate = useTranslate();
	const hasCategories = !! categorization?.categories.length;
	const hasGeneratedDesigns = generatedDesigns.length > 0;
	const isShowAll = ! categorization?.selection || categorization?.selection === SHOW_ALL_SLUG;

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
					onSelect={ onSelect }
					onPreview={ onPreview }
					staticDesigns={ staticDesigns }
					generatedDesigns={ generatedDesigns }
					categorization={ categorization }
					verticalId={ verticalId }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					onCheckout={ onCheckout }
					purchasedThemes={ purchasedThemes }
					currentPlanFeatures={ currentPlanFeatures }
				/>
			</div>
			{ hasGeneratedDesigns && (
				<div
					className={ classnames( 'unified-design-picker__generated-designs', {
						'unified-design-picker__generated-designs--is-showing': isShowAll,
					} ) }
				>
					<div>
						<h3> { translate( 'Custom designs for your site' ) } </h3>
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
				</div>
			) }
		</div>
	);
};

export { UnifiedDesignPicker as default, DesignPreviewImage };
