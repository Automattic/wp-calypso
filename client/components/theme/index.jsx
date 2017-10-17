/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { get, isEmpty, isEqual, noop, some } from 'lodash';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ThemeMoreButton from './more-button';
import PulsingDot from 'components/pulsing-dot';
import Ribbon from 'components/ribbon';

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

	render() {
		const { name, screenshot } = this.props.theme;
		const { active, price, translate, upsellUrl } = this.props;
		const themeClass = classNames( 'theme', {
			'is-active': active,
			'is-actionable': !! ( this.props.screenshotClickUrl || this.props.onScreenshotClick ),
		} );

		const hasPrice = /\d/g.test( price );
		const priceClass = classNames( 'theme-badge__price', {
			'theme-badge__price-upgrade': ! hasPrice,
		} );

		// for performance testing
		const screenshotID = this.props.index === 0 ? 'theme__firstscreenshot' : null;

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		let secondaryContent = null;

		if ( hasPrice && upsellUrl ) {
			const freePrice = price.replace( /[0-9,]+/, '0' );
			secondaryContent = (
				<div className="theme__info-upsell">
					<span>or </span>
					<Button href={ this.props.upsellUrl } compact primary>
						{ translate( '%(freePrice)s with the Premium Plan', { args: { freePrice } } ) }
					</Button>
				</div>
			);
		}

		return (
			<Card className={ themeClass }>
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
								className="theme__img"
								src={ screenshot + '?w=340' }
								srcSet={ screenshot + '?w=340 1x, ' + screenshot + '?w=680 2x' }
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
						<div className="theme__info-detail">
							<div className="theme__info-primary">
								<h2 className="theme__info-title">{ name }</h2>
								{ active && (
									<span className="theme__badge-active">
										{ translate( 'Active', {
											context: 'singular noun, the currently active theme',
										} ) }
									</span>
								) }
								<span className={ priceClass }>{ price }</span>
							</div>
							{ secondaryContent }
						</div>
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

export default localize( Theme );
