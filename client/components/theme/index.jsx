import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Card, Ribbon, Button, Gridicon } from '@automattic/components';
import {
	PremiumBadge,
	StyleVariationBadges,
	WooCommerceBundledBadge,
} from '@automattic/design-picker';
import { Button as LinkButton } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isEmpty, isEqual, some } from 'lodash';
import photon from 'photon';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import PulsingDot from 'calypso/components/pulsing-dot';
import Tooltip from 'calypso/components/tooltip';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { updateThemes } from 'calypso/state/themes/actions/theme-update';
import {
	doesThemeBundleSoftwareSet as getDoesThemeBundleSoftwareSet,
	isSiteEligibleForBundledSoftware as getIsSiteEligibleForBundledSoftware,
	isPremiumThemeAvailable as getIsPremiumThemeAvailable,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
} from 'calypso/state/themes/selectors';
import { isThemePremium as getIsThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
import { setThemesBookmark } from 'calypso/state/themes/themes-ui/actions';
import ThemeMoreButton from './more-button';

import './style.scss';

const noop = () => {};

export class Theme extends Component {
	static propTypes = {
		theme: PropTypes.shape( {
			// Theme ID (theme-slug)
			id: PropTypes.string.isRequired,
			// Theme name
			name: PropTypes.string.isRequired,
			// Theme screenshot URL
			screenshot: PropTypes.string,
			author: PropTypes.string,
			author_uri: PropTypes.string,
			demo_uri: PropTypes.string,
			stylesheet: PropTypes.string,
			taxonomies: PropTypes.object,
			update: PropTypes.object,
			price: PropTypes.any,
			soft_launched: PropTypes.bool,
		} ),
		// If true, highlight this theme as active
		active: PropTypes.bool,
		// Theme price (pre-formatted string) -- empty string indicates free theme
		price: PropTypes.string,
		// If true, the theme is being installed
		installing: PropTypes.bool,
		// If true, render a placeholder
		isPlaceholder: PropTypes.bool,
		// URL the screenshot link points to
		screenshotClickUrl: PropTypes.string,
		// Called when theme screenshot is clicked
		onScreenshotClick: PropTypes.func,
		// Called when theme style variation is clicked
		onStyleVariationClick: PropTypes.func,
		// Called when the more button is clicked
		onMoreButtonClick: PropTypes.func,
		// Options to populate the 'More' button popover menu with
		buttonContents: PropTypes.objectOf(
			PropTypes.shape( {
				label: PropTypes.string,
				header: PropTypes.string,
				action: PropTypes.func,
				getUrl: PropTypes.func,
			} )
		),
		// Index of theme in results list
		index: PropTypes.number,
		// Label to show on screenshot hover.
		actionLabel: PropTypes.string,
		// Translate function,
		translate: PropTypes.func,
		// Themes bookmark items.
		setThemesBookmark: PropTypes.func,
		bookmarkRef: PropTypes.oneOfType( [
			PropTypes.func,
			PropTypes.shape( { current: PropTypes.any } ),
		] ),
		siteId: PropTypes.number,
		isUpdating: PropTypes.bool,
		isUpdated: PropTypes.bool,
		errorOnUpdate: PropTypes.bool,
		softLaunched: PropTypes.bool,
	};

	static defaultProps = {
		isPlaceholder: false,
		buttonContents: {},
		onMoreButtonClick: noop,
		actionLabel: '',
		active: false,
	};

	prevThemeThumbnailRef = createRef( null );
	themeThumbnailRef = createRef( null );
	premiumPopoverRef = createRef( null );

	state = {
		descriptionTooltipVisible: false,
	};

	shouldComponentUpdate( nextProps ) {
		const themeThumbnailRefUpdated = this.themeThumbnailRef.current !== this.themeThumbnailRef.prev;

		if ( themeThumbnailRefUpdated ) {
			this.prevThemeThumbnailRef.current = this.themeThumbnailRef.current;
		}

		return (
			nextProps.theme.id !== this.props.theme.id ||
			nextProps.active !== this.props.active ||
			nextProps.price !== this.props.price ||
			nextProps.installing !== this.props.installing ||
			! isEqual(
				Object.keys( nextProps.buttonContents ),
				Object.keys( this.props.buttonContents )
			) ||
			nextProps.screenshotClickUrl !== this.props.screenshotClickUrl ||
			nextProps.onScreenshotClick !== this.props.onScreenshotClick ||
			nextProps.onStyleVariationClick !== this.props.onStyleVariationClick ||
			nextProps.onMoreButtonClick !== this.props.onMoreButtonClick ||
			themeThumbnailRefUpdated
		);
	}

	showDescriptionTooltip = () => {
		this.setState( { descriptionTooltipVisible: true } );
	};

	hideDescriptionTooltip = () => {
		this.setState( { descriptionTooltipVisible: false } );
	};

	onScreenshotClick = () => {
		const { onScreenshotClick } = this.props;
		if ( typeof onScreenshotClick === 'function' ) {
			onScreenshotClick( this.props.theme.id, this.props.index );
		}
	};

	onStyleVariationClick = ( variation ) => {
		this.props.onStyleVariationClick?.( this.props.theme.id, this.props.index, variation );
	};

	isBeginnerTheme() {
		const { theme } = this.props;
		const skillLevels = get( theme, [ 'taxonomies', 'theme_skill-level' ] );
		return some( skillLevels, { slug: 'beginner' } );
	}

	renderPlaceholder() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card className="theme is-placeholder">
				<div className="theme__content" />
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderInstalling() {
		if ( this.props.installing ) {
			return (
				<div className="theme__installing">
					<PulsingDot active={ true } />
				</div>
			);
		}
	}

	onUpsellClick = () => {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'theme-upsell-popup',
			theme: this.props.theme.id,
		} );
	};

	setBookmark = () => {
		this.props.setThemesBookmark( this.props.theme.id );
	};

	updateTheme = () => {
		this.props.updateThemes( [ this.props.theme.id ], this.props.siteId );
	};

	renderUpdateAlert = () => {
		const { isUpdated, isUpdating, errorOnUpdate, theme, translate } = this.props;

		if ( ! theme.update && ! isUpdated && ! isUpdating && ! errorOnUpdate ) {
			return;
		}

		let content;
		let alertType;

		if ( errorOnUpdate ) {
			alertType = 'danger';
			content = (
				<div>
					<span>
						<Gridicon icon="cross" size={ 18 } />
						{ translate( 'Failed to update Theme.' ) }
					</span>
				</div>
			);
		} else if ( isUpdated ) {
			alertType = 'success';
			content = (
				<div>
					<span>
						<Gridicon icon="checkmark" size={ 18 } />
						{ translate( 'Theme updated!' ) }
					</span>
				</div>
			);
		} else if ( isUpdating ) {
			alertType = 'info';
			content = (
				<div>
					<span>
						<Gridicon className="theme__updating-animated" icon="refresh" size={ 18 } />
						{ translate( 'Updating theme.' ) }
					</span>
				</div>
			);
		} else if ( theme.update ) {
			alertType = 'warning';
			content = (
				<div>
					<span>
						<Gridicon icon="refresh" size={ 18 } />
						{ translate( 'New version available.' ) }
					</span>
					<Button onClick={ this.updateTheme } primary className="theme__button-link" borderless>
						{ translate( 'Update now' ) }
					</Button>
				</div>
			);
		}

		return (
			<div className="theme__update-alert">
				<div className={ `${ alertType } theme__update-alert-content` }>{ content }</div>
			</div>
		);
	};

	goToCheckout = ( plan = 'premium' ) => {
		const { siteSlug } = this.props;

		if ( siteSlug ) {
			const params = new URLSearchParams();
			params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

			window.location.href = `/checkout/${ encodeURIComponent(
				siteSlug
			) }/${ plan }?${ params.toString() }`;
		}
	};

	parseThemePrice = ( price ) => {
		/*
		theme.price on "Recommended" themes tab
		Premium theme: "$50"
		Free theme:    undefined

		theme.price on Trending themes tab
		Premium theme: { value: 50, currency: "USD", display: "<abbr title=\"United States Dollars\">US$</abbr>50" }
		Free theme:    { value: 0, currency: "USD", display: "Free" }

		Try to correctly parse the price for both cases.
		*/
		if ( typeof price === 'object' && 'display' in price ) {
			let parsedThemePrice = price.display;
			// Remove all html tags from the price string
			parsedThemePrice = parsedThemePrice.replace( /(<([^>]+)>)/gi, '' );
			return parsedThemePrice;
		}
		return price;
	};

	getUpsellMessage = () => {
		const {
			hasPremiumThemesFeature,
			theme,
			didPurchaseTheme,
			translate,
			doesThemeBundleSoftwareSet,
			isSiteEligibleForBundledSoftware,
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes,
		} = this.props;

		// Premium themes (non-bundled): Only require premium themes feature (Premium or higher plans)
		// Bundled themes: Require premium themes, atomic, and woop features (Business or higher plans)
		const isUsablePremiumTheme = ! doesThemeBundleSoftwareSet && hasPremiumThemesFeature;
		const isUsableBundledTheme =
			doesThemeBundleSoftwareSet && hasPremiumThemesFeature && isSiteEligibleForBundledSoftware;

		const parsedThemePrice = this.parseThemePrice( theme.price );

		if ( didPurchaseTheme && ! isUsablePremiumTheme && ! isUsableBundledTheme ) {
			return translate( 'You have purchased an annual subscription for this theme' );
		} else if ( isExternallyManagedTheme && ! isSiteEligibleForManagedExternalThemes ) {
			// This is a third-party theme but the user doesn't have an eligible plan.
			return createInterpolateElement(
				translate(
					'This premium theme costs %(price)s per year and can only be purchased if you have the <Link>Business plan</Link> on your site.',
					{
						args: { price: parsedThemePrice },
					}
				),
				{
					Link: <LinkButton isLink onClick={ () => this.goToCheckout( 'business' ) } />,
				}
			);
		} else if ( isExternallyManagedTheme && isSiteEligibleForManagedExternalThemes ) {
			// This is a third-party theme and the user has an eligible plan.
			return translate(
				'This premium theme is only available while your current plan is active and costs %(price)s per year.',
				{
					args: { price: parsedThemePrice },
				}
			);
		} else if ( isUsablePremiumTheme ) {
			return translate( 'The premium theme is included in your plan.' );
		} else if ( isUsableBundledTheme ) {
			return translate( 'The WooCommerce theme is included in your plan.' );
		} else if ( doesThemeBundleSoftwareSet ) {
			return createInterpolateElement(
				translate( 'This WooCommerce theme is included in the <Link>Business plan</Link>.' ),
				{
					Link: <LinkButton isLink onClick={ () => this.goToCheckout( 'business' ) } />,
				}
			);
		}

		return createInterpolateElement(
			sprintf(
				/* translators: the "price" is the price of the theme, example: U$50; */
				translate(
					'This premium theme is included in the <Link>Premium plan</Link>, or you can purchase individually for %(price)s a year'
				),
				{
					price: parsedThemePrice,
				}
			),
			{
				Link: <LinkButton isLink onClick={ this.goToCheckout } />,
			}
		);
	};

	getUpsellPopoverContent = () => {
		const { doesThemeBundleSoftwareSet, isExternallyManagedTheme, theme, translate } = this.props;

		return (
			<>
				<TrackComponentView
					eventName="calypso_upgrade_nudge_impression"
					eventProperties={ { cta_name: 'theme-upsell-popup', theme: theme.id } }
				/>
				<div>
					<div data-testid="upsell-header" className="theme__upsell-header">
						{ ( ! doesThemeBundleSoftwareSet || isExternallyManagedTheme ) &&
							translate( 'Premium theme' ) }
						{ doesThemeBundleSoftwareSet &&
							! isExternallyManagedTheme &&
							translate( 'WooCommerce theme' ) }
					</div>
					<div data-testid="upsell-message">{ this.getUpsellMessage() }</div>
				</div>
			</>
		);
	};

	renderUpsell = () => {
		const {
			active,
			doesThemeBundleSoftwareSet,
			isExternallyManagedTheme,
			isPremiumTheme,
			isPremiumThemeAvailable,
			theme,
		} = this.props;

		/*
		 * Only show the Premium badge if we're not already showing the price
		 * and the theme isn't the active theme.
		 */
		const showPremiumBadge = isPremiumTheme && isPremiumThemeAvailable && ! active;
		const isNewCardsOnly = isEnabled( 'themes/showcase-i4/cards-only' );
		const isNewDetailsAndPreview = isEnabled( 'themes/showcase-i4/details-and-preview' );
		const popoverContent = this.getUpsellPopoverContent();

		return (
			<span className="theme__upsell">
				<TrackComponentView
					eventName="calypso_upgrade_nudge_impression"
					eventProperties={ { cta_name: 'theme-upsell', theme: theme.id } }
				/>
				{ isNewCardsOnly || isNewDetailsAndPreview ? (
					<>
						{ ( ! doesThemeBundleSoftwareSet || isExternallyManagedTheme ) && (
							<PremiumBadge
								className="theme__upsell-popover"
								tooltipClassName="theme__upsell-popover info-popover__tooltip"
								tooltipContent={ popoverContent }
								tooltipPosition="top"
							/>
						) }
						{ doesThemeBundleSoftwareSet && ! isExternallyManagedTheme && (
							<WooCommerceBundledBadge
								className="theme__upsell-popover"
								tooltipClassName="theme__upsell-popover info-popover__tooltip"
								tooltipContent={ popoverContent }
								tooltipPosition="top"
							/>
						) }
					</>
				) : (
					<InfoPopover
						icon="star"
						showOnHover={ true }
						className={ classNames(
							'theme__upsell-popover',
							isPremiumThemeAvailable || showPremiumBadge ? 'active' : null
						) }
						position="top"
					>
						{ popoverContent }
					</InfoPopover>
				) }
			</span>
		);
	};

	renderStyleVariations = () => {
		const { theme } = this.props;
		const { style_variations = [] } = theme;

		return (
			style_variations.length > 0 && (
				<div className="theme__info-style-variations">
					<StyleVariationBadges
						variations={ style_variations }
						onMoreClick={ this.onStyleVariationClick }
						onClick={ this.onStyleVariationClick }
					/>
				</div>
			)
		);
	};

	renderMoreButton = () => {
		const { active, buttonContents, index, theme, onMoreButtonClick } = this.props;
		if ( isEmpty( buttonContents ) ) {
			return null;
		}

		return (
			<ThemeMoreButton
				index={ index }
				themeId={ theme.id }
				themeName={ theme.name }
				active={ active }
				onMoreButtonClick={ onMoreButtonClick }
				options={ buttonContents }
			/>
		);
	};

	softLaunchedBanner = () => {
		const { translate } = this.props;

		return (
			<>
				{ this.props.softLaunched && (
					<div className="theme__info-soft-launched">
						<div className="theme__info-soft-launched-banner">{ translate( 'A8C Only' ) }</div>
					</div>
				) }
			</>
		);
	};

	render() {
		const {
			active,
			price,
			theme,
			translate,
			upsellUrl,
			hasPremiumThemesFeature,
			isPremiumTheme,
			didPurchaseTheme,
			isExternallyManagedTheme,
		} = this.props;
		const { name, description, screenshot, style_variations = [] } = theme;
		const isNewCardsOnly = isEnabled( 'themes/showcase-i4/cards-only' );
		const isNewDetailsAndPreview = isEnabled( 'themes/showcase-i4/details-and-preview' );
		const isActionable = this.props.screenshotClickUrl || this.props.onScreenshotClick;
		const themeClass = classNames( 'theme', {
			'is-active': active,
			'is-actionable': isActionable,
		} );

		const themeNeedsPurchase = isPremiumTheme && ! hasPremiumThemesFeature && ! didPurchaseTheme;
		const showUpsell = upsellUrl && ( isPremiumTheme || isExternallyManagedTheme ) && ! active;
		const priceClass = classNames( 'theme__badge-price', {
			'theme__badge-price-upgrade': ! themeNeedsPurchase,
			'theme__badge-price-upsell': showUpsell,
		} );

		const themeDescription = decodeEntities( description );

		// for performance testing
		const screenshotID = this.props.index === 0 ? 'theme__firstscreenshot' : null;

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const fit = '479,360';
		const themeImgSrc = photon( screenshot, { fit } ) || screenshot;
		const themeImgSrcDoubleDpi = photon( screenshot, { fit, zoom: 2 } ) || screenshot;
		const e2eThemeName = name.toLowerCase().replace( /\s+/g, '-' );
		const bookmarkRef = this.props.bookmarkRef ? { ref: this.props.bookmarkRef } : {};

		return (
			<Card className={ themeClass } data-e2e-theme={ e2eThemeName } onClick={ this.setBookmark }>
				{ this.isBeginnerTheme() && (
					<Ribbon className="theme__ribbon" color="green">
						{ translate( 'Beginner' ) }
					</Ribbon>
				) }
				<div ref={ this.themeThumbnailRef } className="theme__content" { ...bookmarkRef }>
					{ this.renderUpdateAlert() }
					<a
						aria-label={ name }
						className="theme__thumbnail"
						href={ this.props.screenshotClickUrl || 'javascript:;' /* fallback for a11y */ }
						onClick={ this.onScreenshotClick }
						onMouseEnter={ this.showDescriptionTooltip }
						onMouseLeave={ this.hideDescriptionTooltip }
					>
						{ isActionable && (
							<div className="theme__thumbnail-label">{ this.props.actionLabel }</div>
						) }
						{ this.renderInstalling() }
						{ screenshot ? (
							<img
								alt={ themeDescription }
								className="theme__img"
								src={ themeImgSrc }
								srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
								id={ screenshotID }
							/>
						) : (
							<div className="theme__no-screenshot">
								<Gridicon icon="themes" size={ 48 } />
							</div>
						) }
					</a>

					<Tooltip
						context={ this.themeThumbnailRef.current }
						isVisible={ this.state.descriptionTooltipVisible }
						showDelay={ 1000 }
					>
						<div className="theme__tooltip">{ themeDescription }</div>
					</Tooltip>

					{ this.softLaunchedBanner() }

					<div
						className={ classNames( 'theme__info', {
							'has-style-variations': isNewDetailsAndPreview && style_variations.length > 0,
						} ) }
					>
						<h2 className="theme__info-title">{ name }</h2>
						{ active && (
							<span className="theme__badge-active">
								{ translate( 'Active', {
									context: 'singular noun, the currently active theme',
								} ) }
							</span>
						) }
						{ ! isNewCardsOnly && ! isNewDetailsAndPreview && active && (
							<span className={ priceClass }>{ price }</span>
						) }
						{ isNewDetailsAndPreview && ! active && this.renderStyleVariations() }
						{ upsellUrl && // Do not show any pricing related infomation if there's no upsell action link.
							( showUpsell
								? this.renderUpsell()
								: ( isNewCardsOnly || isNewDetailsAndPreview ) &&
								  ! active && (
										<span className="theme__info-upsell-description">{ translate( 'Free' ) }</span>
								  ) ) }
						{ this.renderMoreButton() }
					</div>
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, { theme, siteId, hasPremiumThemesFeature } ) => {
		const {
			themes: { themesUpdate },
		} = state;
		const { themesUpdateFailed, themesUpdating, themesUpdated } = themesUpdate;
		return {
			errorOnUpdate: themesUpdateFailed && themesUpdateFailed.indexOf( theme.id ) > -1,
			isUpdating: themesUpdating && themesUpdating.indexOf( theme.id ) > -1,
			isUpdated: themesUpdated && themesUpdated.indexOf( theme.id ) > -1,
			isPremiumTheme: getIsThemePremium( state, theme.id ),
			hasPremiumThemesFeature:
				hasPremiumThemesFeature?.() ||
				siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES ),
			doesThemeBundleSoftwareSet: getDoesThemeBundleSoftwareSet( state, theme.id ),
			isSiteEligibleForBundledSoftware: getIsSiteEligibleForBundledSoftware( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
			didPurchaseTheme: isThemePurchased( state, theme.id, siteId ),
			isPremiumThemeAvailable: getIsPremiumThemeAvailable( state, theme.id, siteId ),
			isExternallyManagedTheme: getIsExternallyManagedTheme( state, theme.id ),
			isSiteEligibleForManagedExternalThemes: getIsSiteEligibleForManagedExternalThemes(
				state,
				siteId
			),
		};
	},
	{ recordTracksEvent, setThemesBookmark, updateThemes }
)( localize( Theme ) );
