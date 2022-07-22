import { Card, Ribbon, Button, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, isEmpty, isEqual, some } from 'lodash';
import photon from 'photon';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import PulsingDot from 'calypso/components/pulsing-dot';
import Tootlip from 'calypso/components/tooltip';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { decodeEntities } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateThemes } from 'calypso/state/themes/actions/theme-update';
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

	render() {
		const { active, price, theme, translate, upsellUrl } = this.props;
		const { name, description, screenshot } = theme;
		const isActionable = this.props.screenshotClickUrl || this.props.onScreenshotClick;
		const themeClass = classNames( 'theme', {
			'is-active': active,
			'is-actionable': isActionable,
		} );

		const hasPrice = /\d/g.test( price );
		const showUpsell = hasPrice && upsellUrl;
		const priceClass = classNames( 'theme__badge-price', {
			'theme__badge-price-upgrade': ! hasPrice,
			'theme__badge-price-upsell': showUpsell,
		} );

		/*
		 * Check the theme object (not the price prop) for the true price.
		 * Sometimes it will be an object, other times it will be a string.
		 * Check both cases to ensure we have a non-zero price.
		 */
		let isPremiumTheme = false;
		if ( typeof theme.price === 'object' && 0 !== theme.price.value ) {
			isPremiumTheme = true;
		} else if ( typeof theme.price === 'string' && '' !== theme.price ) {
			isPremiumTheme = true;
		}

		/*
		 * Only show the Premium badge if we're not already showing the price
		 * and the theme isn't the active theme.
		 */
		const showPremiumBadge = isPremiumTheme && ! hasPrice && ! active;

		const themeDescription = decodeEntities( description );

		// for performance testing
		const screenshotID = this.props.index === 0 ? 'theme__firstscreenshot' : null;

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const impressionEventName = 'calypso_upgrade_nudge_impression';
		const upsellEventProperties = { cta_name: 'theme-upsell', theme: theme.id };
		const upsellPopupEventProperties = { cta_name: 'theme-upsell-popup', theme: theme.id };
		const upsell = showUpsell && (
			<span className="theme__upsell">
				<TrackComponentView
					eventName={ impressionEventName }
					eventProperties={ upsellEventProperties }
				/>
				<InfoPopover icon="star" className="theme__upsell-icon" position="top left">
					<TrackComponentView
						eventName={ impressionEventName }
						eventProperties={ upsellPopupEventProperties }
					/>
					<div className="theme__upsell-popover">
						<h2 className="theme__upsell-heading">
							{ translate( 'Use this theme at no extra cost on our Premium or Business Plan' ) }
						</h2>
						<Button
							onClick={ this.onUpsellClick }
							className="theme__upsell-cta"
							primary
							href={ upsellUrl }
						>
							{ translate( 'Upgrade Now' ) }
						</Button>
					</div>
				</InfoPopover>
			</span>
		);

		const fit = '479,360';
		const themeImgSrc = photon( screenshot, { fit } );
		const themeImgSrcDoubleDpi = photon( screenshot, { fit, zoom: 2 } );
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

					<Tootlip
						context={ this.themeThumbnailRef.current }
						isVisible={ this.state.descriptionTooltipVisible }
						showDelay={ 1000 }
					>
						<div className="theme__tooltip">{ themeDescription }</div>
					</Tootlip>

					<div className="theme__info">
						<h2 className="theme__info-title">{ name }</h2>
						{ active && (
							<span className="theme__badge-active">
								{ translate( 'Active', {
									context: 'singular noun, the currently active theme',
								} ) }
							</span>
						) }
						{ showPremiumBadge && (
							<span className="theme__badge-premium">{ translate( 'Premium' ) }</span>
						) }
						<span className={ priceClass }>{ price }</span>
						{ upsell }
						{ ! isEmpty( this.props.buttonContents ) ? (
							<ThemeMoreButton
								index={ this.props.index }
								themeId={ this.props.theme.id }
								active={ this.props.active }
								onMoreButtonClick={ this.props.onMoreButtonClick }
								options={ this.props.buttonContents }
							/>
						) : null }
					</div>
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, { theme } ) => {
		const {
			themes: { themesUpdate },
		} = state;
		const { themesUpdateFailed, themesUpdating, themesUpdated } = themesUpdate;
		return {
			errorOnUpdate: themesUpdateFailed && themesUpdateFailed.indexOf( theme.id ) > -1,
			isUpdating: themesUpdating && themesUpdating.indexOf( theme.id ) > -1,
			isUpdated: themesUpdated && themesUpdated.indexOf( theme.id ) > -1,
		};
	},
	{ recordTracksEvent, setThemesBookmark, updateThemes }
)( localize( Theme ) );
