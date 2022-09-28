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
}

const DesignButton: React.FC< DesignButtonProps > = ( {
	locale,
	onPreview,
	design,
	isPremiumThemeAvailable = false,
	hasPurchasedTheme = false,
	onCheckout,
	verticalId,
} ) => {
	const { __ } = useI18n();
	const { style_variations = [], is_premium: isPremium = false } = design;
	const isEnableThemeStyleVariations = isEnabled( 'signup/design-picker-style-selection' );
	const shouldUpgrade = isPremium && ! isPremiumThemeAvailable && ! hasPurchasedTheme;

	const showBundledBadge =
		isEnabled( 'themes/plugin-bundling' ) &&
		( design.software_sets || [] ).some( ( { slug } ) => slug === 'woo-on-plans' );

	function getPricingDescription() {
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

		let badge: React.ReactNode = null;
		if ( showBundledBadge ) {
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
			<div className="design-picker__pricing-description">
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
						{ isEnableThemeStyleVariations && style_variations.length > 0 && (
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

const wasThemePurchased = ( purchasedThemes: string[] | undefined, design: Design ) =>
	purchasedThemes
		? purchasedThemes.some( ( themeId ) => design?.recipe?.stylesheet?.endsWith( '/' + themeId ) )
		: false;

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
}

interface StaticDesignPickerProps {
	locale: string;
	verticalId?: string;
	onSelect: ( design: Design ) => void;
	onPreview: ( design: Design, variation?: StyleVariation ) => void;
	designs: Design[];
	categorization?: Categorization;
	isPremiumThemeAvailable?: boolean;
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
	designs,
	categorization,
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
						isPremiumThemeAvailable={ isPremiumThemeAvailable }
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
	verticalId,
	staticDesigns,
	generatedDesigns,
	heading,
	categorization,
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
					designs={ staticDesigns }
					categorization={ categorization }
					verticalId={ verticalId }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
					onCheckout={ onCheckout }
					purchasedThemes={ purchasedThemes }
				/>
			</div>
		</div>
	);
};

export { UnifiedDesignPicker as default, DesignPreviewImage };
