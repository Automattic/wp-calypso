import { Card, Button, Gridicon } from '@automattic/components';
import { DesignPreviewImage, ThemeCard } from '@automattic/design-picker';
import { localize } from 'i18n-calypso';
import { isEmpty, isEqual } from 'lodash';
import photon from 'photon';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { updateThemes } from 'calypso/state/themes/actions/theme-update';
import {
	getMarketplaceThemeSubscriptionPrices,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isMarketplaceThemeSubscribed,
	isThemePurchased,
	getThemeType,
	canUseTheme,
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
		selectedStyleVariation: PropTypes.object,
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
		const { isExternallyManagedTheme, selectedStyleVariation, theme } = this.props;
		const { description, screenshot } = theme;

		if ( ! screenshot ) {
			return (
				<div className="theme__no-screenshot">
					<Gridicon icon="themes" size={ 48 } />
				</div>
			);
		}

		// mShots don't work well with SSR, since it shows a placeholder image by default
		// the snapshot request is completed.
		//
		// With that in mind, we only use mShots for non-default style variations to ensure
		// that there is no flash of image transition from static image to mShots on page load.
		if ( !! selectedStyleVariation && ! isExternallyManagedTheme ) {
			const { id: themeId, stylesheet } = theme;

			return (
				<DesignPreviewImage
					design={ { slug: themeId, recipe: { stylesheet } } }
					styleVariation={ selectedStyleVariation }
				/>
			);
		}

		const fit = '479,360';
		const themeImgSrc = photon( screenshot, { fit } ) || screenshot;
		const themeImgSrcDoubleDpi = photon( screenshot, { fit, zoom: 2 } ) || screenshot;

		return (
			<img
				alt={ decodeEntities( description ) }
				className="theme__img"
				src={ themeImgSrc }
				srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
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

	renderMoreButton = () => {
		const { active, buttonContents, index, theme } = this.props;
		if ( isEmpty( buttonContents ) ) {
			return null;
		}

		return (
			<ThemeMoreButton
				index={ index }
				themeId={ theme.id }
				themeName={ theme.name }
				active={ active }
				onMoreButtonClick={ this.props.onMoreButtonClick }
				onMoreButtonItemClick={ this.props.onMoreButtonItemClick }
				options={ buttonContents }
			/>
		);
	};

	render() {
		const { selectedStyleVariation, theme } = this.props;
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
				styleVariations={ style_variations }
				selectedStyleVariation={ selectedStyleVariation }
				optionsMenu={ this.renderMoreButton() }
				isActive={ this.props.active }
				isInstalling={ this.props.installing }
				isSoftLaunched={ this.props.softLaunched }
				isShowDescriptionOnImageHover
				onClick={ this.setBookmark }
				onImageClick={ this.onScreenshotClick }
				onStyleVariationClick={ this.onStyleVariationClick }
				onStyleVariationMoreClick={ this.onStyleVariationClick }
				id={ theme.id }
				type={ this.props.type }
				isPurchased={ this.props.didPurchaseTheme || this.props.hasMarketplaceThemeSubscription }
				canUseTheme={ this.props.canUseTheme }
				subscriptionPrices={ this.props.themeSubscriptionPrices }
				siteSlug={ this.props.siteSlug }
			/>
		);
	}
}

export default connect(
	( state, { theme, siteId } ) => {
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
			siteSlug: getSiteSlug( state, siteId ),
			didPurchaseTheme: isThemePurchased( state, theme.id, siteId ),
			hasMarketplaceThemeSubscription,
			isExternallyManagedTheme,
			themeSubscriptionPrices,
			type: getThemeType( state, theme.id ),
			canUseTheme: canUseTheme( state, siteId, theme.id ),
		};
	},
	{ recordTracksEvent, setThemesBookmark, updateThemes }
)( localize( Theme ) );
