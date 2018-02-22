/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { get, isEmpty, isEqual, noop, some } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import photon from 'photon';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ThemeMoreButton from './more-button';
import PulsingDot from 'components/pulsing-dot';
import Ribbon from 'components/ribbon';
import InfoPopover from 'components/info-popover';
import Button from 'components/button';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Component
 */
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
	};

	static defaultProps = {
		isPlaceholder: false,
		buttonContents: {},
		onMoreButtonClick: noop,
		actionLabel: '',
		active: false,
	};

	shouldComponentUpdate( nextProps ) {
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
			nextProps.onMoreButtonClick !== this.props.onMoreButtonClick
		);
	}

	onScreenshotClick = () => {
		this.props.onScreenshotClick( this.props.theme.id, this.props.index );
	};

	isBeginnerTheme = () => {
		const { theme } = this.props;
		const skillLevels = get( theme, [ 'taxonomies', 'theme_skill-level' ] );
		return some( skillLevels, { slug: 'beginner' } );
	};

	renderPlaceholder = () => {
		return (
			<Card className="theme is-placeholder">
				<div className="theme__content" />
			</Card>
		);
	};

	renderHover = () => {
		if ( this.props.screenshotClickUrl || this.props.onScreenshotClick ) {
			return (
				<a
					className="theme__active-focus"
					href={ this.props.screenshotClickUrl }
					onClick={ this.onScreenshotClick }
				>
					<span>{ this.props.actionLabel }</span>
				</a>
			);
		}
	};

	renderInstalling = () => {
		if ( this.props.installing ) {
			return (
				<div className="theme__installing">
					<PulsingDot active={ true } />
				</div>
			);
		}
	};

	onUpsellClick = () => {
		this.props.recordTracksEvent( 'calypso_upgrade_nudge_cta_click', {
			cta_name: 'theme-upsell-popup',
			theme: this.props.theme.id,
		} );
	};

	render() {
		const { active, price, theme, translate, upsellUrl } = this.props;
		const { name, description, screenshot } = theme;
		const themeClass = classNames( 'theme', {
			'is-active': active,
			'is-actionable': !! ( this.props.screenshotClickUrl || this.props.onScreenshotClick ),
		} );

		const hasPrice = /\d/g.test( price );
		const showUpsell = hasPrice && upsellUrl;
		const priceClass = classNames( 'theme__badge-price', {
			'theme__badge-price-upgrade': ! hasPrice,
			'theme__badge-price-test': showUpsell,
		} );

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

		return (
			<Card className={ themeClass } data-e2e-theme={ e2eThemeName }>
				{ this.isBeginnerTheme() && (
					<Ribbon className="theme__ribbon" color="green">
						{ translate( 'Beginner' ) }
					</Ribbon>
				) }
				<div className="theme__content">
					{ this.renderHover() }

					<a href={ this.props.screenshotClickUrl }>
						{ this.renderInstalling() }
						{ screenshot ? (
							<img
								alt={ description }
								className="theme__img"
								src={ themeImgSrc }
								srcSet={ `${ themeImgSrcDoubleDpi } 2x` }
								onClick={ this.onScreenshotClick }
								id={ screenshotID }
							/>
						) : (
							<div className="theme__no-screenshot">
								<Gridicon icon="themes" size={ 48 } />
							</div>
						) }
					</a>

					<div className="theme__info">
						<h2 className="theme__info-title">{ name }</h2>
						{ active && (
							<span className="theme__badge-active">
								{ translate( 'Active', {
									context: 'singular noun, the currently active theme',
								} ) }
							</span>
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

const mapStateToProps = null;
const mapDispatchToProps = { recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( Theme ) );
