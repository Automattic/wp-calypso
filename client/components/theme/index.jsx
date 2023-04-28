import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Card, Button, Gridicon } from '@automattic/components';
import { PremiumBadge, ThemeCard, WooCommerceBundledBadge } from '@automattic/design-picker';
import { Button as LinkButton } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty, isEqual } from 'lodash';
import photon from 'photon';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { updateThemes } from 'calypso/state/themes/actions/theme-update';
import {
	doesThemeBundleSoftwareSet as getDoesThemeBundleSoftwareSet,
	getMarketplaceThemeSubscriptionPrices,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isMarketplaceThemeSubscribed,
	isPremiumThemeAvailable as getIsPremiumThemeAvailable,
	isSiteEligibleForBundledSoftware as getIsSiteEligibleForBundledSoftware,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
	isThemePremium as getIsThemePremium,
	isThemePurchased,
	isWporgTheme as getIsWporgTheme,
} from 'calypso/state/themes/selectors';
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
			soft_launched: PropTypes.bool,
		} ),
		// If true, highlight this theme as active
		active: PropTypes.bool,
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
		// Called when a more button item is clicked
		onMoreButtonItemClick: PropTypes.func,
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
		onMoreButtonItemClick: noop,
		actionLabel: '',
		active: false,
	};

	prevThemeThumbnailRef = createRef( null );
	themeThumbnailRef = createRef( null );

	shouldComponentUpdate( nextProps ) {
		const themeThumbnailRefUpdated = this.themeThumbnailRef.current !== this.themeThumbnailRef.prev;
		if ( themeThumbnailRefUpdated ) {
			this.prevThemeThumbnailRef.current = this.themeThumbnailRef.current;
		}

		return (
			nextProps.theme.id !== this.props.theme.id ||
			nextProps.active !== this.props.active ||
			nextProps.installing !== this.props.installing ||
			! isEqual(
				Object.keys( nextProps.buttonContents ),
				Object.keys( this.props.buttonContents )
			) ||
			nextProps.screenshotClickUrl !== this.props.screenshotClickUrl ||
			nextProps.onScreenshotClick !== this.props.onScreenshotClick ||
			nextProps.onStyleVariationClick !== this.props.onStyleVariationClick ||
			nextProps.onMoreButtonClick !== this.props.onMoreButtonClick ||
			nextProps.onMoreButtonItemClick !== this.props.onMoreButtonItemClick ||
			themeThumbnailRefUpdated
		);
	}

	onScreenshotClick = () => {
		const { onScreenshotClick } = this.props;
		if ( typeof onScreenshotClick === 'function' ) {
			onScreenshotClick( this.props.theme.id, this.props.index );
		}
	};

	onStyleVariationClick = ( variation ) => {
		this.props.onStyleVariationClick?.( this.props.theme.id, this.props.index, variation );
	};

	renderPlaceholder() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card className="theme theme-card is-placeholder">
				<div className="theme__content" />
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	renderScreenshot() {
		const { index, theme } = this.props;
		const { description, screenshot } = theme;
		if ( ! screenshot ) {
			return (
				<div className="theme__no-screenshot">
					<Gridicon icon="themes" size={ 48 } />
				</div>
			);
		}

		const fit = '479,360';
		const themeImgSrc = photon( screenshot, { fit } ) || screenshot;
		const themeImgSrcDoubleDpi = photon( screenshot, { fit, zoom: 2 } ) || screenshot;

		// for performance testing
		const screenshotID = index === 0 ? 'theme__firstscreenshot' : null;

		return (
			<img
				alt={ decodeEntities( description ) }
				className="theme__img"
				src={ themeImgSrc }
				srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
				id={ screenshotID }
			/>
		);
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

		this.props.recordTracksEvent( 'calypso_theme_tooltip_upgrade_nudge_click', { plan } );

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
			didPurchaseTheme,
			doesThemeBundleSoftwareSet,
			hasMarketplaceThemeSubscription,
			hasPremiumThemesFeature,
			theme,
			translate,
			isSiteEligibleForBundledSoftware,
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes,
			isWporgTheme,
			themeSubscriptionPrices,
		} = this.props;

		// Premium themes (non-bundled): Only require premium themes feature (Premium or higher plans)
		// Bundled themes: Require premium themes, atomic, and woop features (Business or higher plans)
		const isUsablePremiumTheme = ! doesThemeBundleSoftwareSet && hasPremiumThemesFeature;
		const isUsableBundledTheme =
			doesThemeBundleSoftwareSet && hasPremiumThemesFeature && isSiteEligibleForBundledSoftware;

		if (
			didPurchaseTheme &&
			! isUsablePremiumTheme &&
			! isUsableBundledTheme &&
			! isExternallyManagedTheme
		) {
			return translate( 'You have purchased this theme.' );
		} else if ( isExternallyManagedTheme && hasMarketplaceThemeSubscription ) {
			if ( isSiteEligibleForManagedExternalThemes ) {
				return translate(
					'You have a subscription for this theme, and it will be usable as long as you keep a Business plan or higher on your site.'
				);
			}
			return createInterpolateElement(
				translate(
					'You have a subscription for this theme, but it will only be usable if you have the <link>Business plan</link> on your site.'
				),
				{
					link: <LinkButton isLink onClick={ () => this.goToCheckout( 'business' ) } />,
				}
			);
		} else if ( isExternallyManagedTheme && ! isSiteEligibleForManagedExternalThemes ) {
			// This is a third-party theme but the user doesn't have an eligible plan.
			return createInterpolateElement(
				/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
				translate(
					'This premium theme costs %(annualPrice)s per year or %(monthlyPrice)s per month, and can only be purchased if you have the <Link>Business plan</Link> on your site.',
					{
						args: {
							annualPrice: themeSubscriptionPrices?.year ?? '',
							monthlyPrice: themeSubscriptionPrices?.month ?? '',
						},
					}
				),
				{
					Link: <LinkButton isLink onClick={ () => this.goToCheckout( 'business' ) } />,
				}
			);
		} else if ( isExternallyManagedTheme && isSiteEligibleForManagedExternalThemes ) {
			// This is a third-party theme and the user has an eligible plan.
			/* translators: annualPrice and monthlyPrice are prices for the theme, examples: US$50, US$7; */
			return translate(
				'This premium theme is only available while your current plan is active and costs %(annualPrice)s per year or %(monthlyPrice)s per month.',
				{
					args: {
						annualPrice: themeSubscriptionPrices?.year ?? '',
						monthlyPrice: themeSubscriptionPrices?.month ?? '',
					},
				}
			);
		} else if ( isUsablePremiumTheme ) {
			return translate( 'This premium theme is included in your plan.' );
		} else if ( isUsableBundledTheme ) {
			return translate( 'This WooCommerce theme is included in your plan.' );
		} else if ( doesThemeBundleSoftwareSet ) {
			return createInterpolateElement(
				translate( 'This WooCommerce theme is included in the <Link>Business plan</Link>.' ),
				{
					Link: <LinkButton isLink onClick={ () => this.goToCheckout( 'business' ) } />,
				}
			);
		} else if ( isWporgTheme ) {
			return createInterpolateElement(
				translate(
					'This community theme can only be installed if you have the <Link>Business plan</Link> or higher on your site.'
				),
				{
					Link: <LinkButton isLink onClick={ () => this.goToCheckout( 'business' ) } />,
				}
			);
		}

		return createInterpolateElement(
			sprintf(
				/* translators: the "price" is the price of the theme, example: US$50; */
				translate(
					'This premium theme is included in the <Link>Premium plan</Link>, or you can purchase individually for %(price)s.'
				),
				{
					price: this.parseThemePrice( theme.price ),
				}
			),
			{
				Link: <LinkButton isLink onClick={ () => this.goToCheckout( 'premium' ) } />,
			}
		);
	};

	getUpsellHeader = () => {
		const { doesThemeBundleSoftwareSet, isExternallyManagedTheme, isWporgTheme, translate } =
			this.props;

		if ( isWporgTheme ) {
			return translate( 'Community theme', {
				context: 'This theme is developed and supported by a community',
				textOnly: true,
			} );
		}

		if ( isExternallyManagedTheme ) {
			return translate( 'Paid theme' );
		}

		if ( doesThemeBundleSoftwareSet ) {
			return translate( 'WooCommerce theme' );
		}

		return translate( 'Premium theme' );
	};

	getUpsellPopoverContent = () => {
		const { theme } = this.props;

		return (
			<>
				<TrackComponentView
					eventName="calypso_upgrade_nudge_impression"
					eventProperties={ { cta_name: 'theme-upsell-popup', theme: theme.id } }
				/>
				<div>
					<div data-testid="upsell-header" className="theme__upsell-header">
						{ this.getUpsellHeader() }
					</div>
					<div data-testid="upsell-message">{ this.getUpsellMessage() }</div>
				</div>
			</>
		);
	};

	getPremiumThemeBadge = () => {
		const { doesThemeBundleSoftwareSet, isExternallyManagedTheme, isWporgTheme, translate } =
			this.props;

		const commonProps = {
			className: 'theme__upsell-popover',
			tooltipClassName: 'theme__upsell-popover info-popover__tooltip',
			tooltipContent: this.getUpsellPopoverContent(),
			tooltipPosition: 'top',
		};

		if ( isWporgTheme ) {
			return (
				<PremiumBadge
					{ ...commonProps }
					className={ classNames( commonProps.className, 'badge--info' ) }
					labelText={ translate( 'Community', {
						context: 'This theme is developed and supported by a community',
						textOnly: true,
					} ) }
					shouldHideIcon
				/>
			);
		}

		if ( isExternallyManagedTheme ) {
			return (
				<PremiumBadge
					{ ...commonProps }
					className={ classNames( commonProps.className, 'theme__marketplace-theme' ) }
					labelText={ translate( 'Paid', {
						context: 'Refers to paid service, such as paid theme',
						textOnly: true,
					} ) }
				/>
			);
		}

		if ( doesThemeBundleSoftwareSet ) {
			return <WooCommerceBundledBadge { ...commonProps } />;
		}

		return <PremiumBadge { ...commonProps } />;
	};

	renderUpsell = () => {
		const { theme } = this.props;

		return (
			<>
				<TrackComponentView
					eventName="calypso_upgrade_nudge_impression"
					eventProperties={ { cta_name: 'theme-upsell', theme: theme.id } }
				/>
				{ this.getPremiumThemeBadge() }
			</>
		);
	};

	renderPricingBadge = () => {
		const { active, isExternallyManagedTheme, isPremiumTheme, isWporgTheme, translate } =
			this.props;
		if ( active ) {
			return null;
		}

		if ( isExternallyManagedTheme || isPremiumTheme || isWporgTheme ) {
			return this.renderUpsell();
		}

		return <span>{ translate( 'Free' ) }</span>;
	};

	renderMoreButton = () => {
		const { active, buttonContents, index, theme, onMoreButtonClick, onMoreButtonItemClick } =
			this.props;
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
				onMoreButtonItemClick={ onMoreButtonItemClick }
				options={ buttonContents }
			/>
		);
	};

	render() {
		const { theme } = this.props;
		const { name, description, style_variations = [] } = theme;
		const themeDescription = decodeEntities( description );

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		return (
			<ThemeCard
				ref={ this.props.bookmarkRef }
				name={ name }
				description={ themeDescription }
				image={ this.renderScreenshot() }
				imageClickUrl={ this.props.screenshotClickUrl }
				imageActionLabel={ this.props.actionLabel }
				banner={ this.renderUpdateAlert() }
				badge={ this.renderPricingBadge() }
				styleVariations={ style_variations }
				optionsMenu={ this.renderMoreButton() }
				isActive={ this.props.active }
				isInstalling={ this.props.installing }
				isSoftLaunched={ this.props.softLaunched }
				isShowDescriptionOnImageHover
				onClick={ this.setBookmark }
				onImageClick={ this.onScreenshotClick }
				onStyleVariationClick={ this.onStyleVariationClick }
				onStyleVariationMoreClick={ this.onStyleVariationClick }
			/>
		);
	}
}

export default connect(
	( state, { theme, siteId, hasPremiumThemesFeature } ) => {
		const {
			themes: { themesUpdate },
		} = state;
		const { themesUpdateFailed, themesUpdating, themesUpdated } = themesUpdate;
		const isExternallyManagedTheme = getIsExternallyManagedTheme( state, theme.id );
		const themeSubscriptionPrices = isExternallyManagedTheme
			? getMarketplaceThemeSubscriptionPrices( state, theme?.id )
			: {};
		const hasMarketplaceThemeSubscription = isExternallyManagedTheme
			? isMarketplaceThemeSubscribed( state, theme?.id, siteId )
			: false;

		return {
			errorOnUpdate: themesUpdateFailed && themesUpdateFailed.indexOf( theme.id ) > -1,
			isUpdating: themesUpdating && themesUpdating.indexOf( theme.id ) > -1,
			isUpdated: themesUpdated && themesUpdated.indexOf( theme.id ) > -1,
			isPremiumTheme: getIsThemePremium( state, theme.id ),
			isWporgTheme: getIsWporgTheme( state, theme.id ),
			hasPremiumThemesFeature:
				hasPremiumThemesFeature?.() ||
				siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES ),
			doesThemeBundleSoftwareSet: getDoesThemeBundleSoftwareSet( state, theme.id ),
			isSiteEligibleForBundledSoftware: getIsSiteEligibleForBundledSoftware( state, siteId ),
			siteSlug: getSiteSlug( state, siteId ),
			didPurchaseTheme: isThemePurchased( state, theme.id, siteId ),
			hasMarketplaceThemeSubscription,
			isPremiumThemeAvailable: getIsPremiumThemeAvailable( state, theme.id, siteId ),
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes: getIsSiteEligibleForManagedExternalThemes(
				state,
				siteId
			),
			themeSubscriptionPrices,
		};
	},
	{ recordTracksEvent, setThemesBookmark, updateThemes }
)( localize( Theme ) );
