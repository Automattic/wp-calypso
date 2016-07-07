/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ThemeMoreButton from './more-button';
import Gridicon from 'components/gridicon';

/**
 * Component
 */
const Theme = React.createClass( {

	propTypes: {
		theme: React.PropTypes.shape( {
			// Theme ID (theme-slug)
			id: React.PropTypes.string.isRequired,
			// Theme name
			name: React.PropTypes.string.isRequired,
			// Theme screenshot URL
			screenshot: React.PropTypes.string,
			// Theme price (pre-formatted string) -- empty string indicates free theme
			price: React.PropTypes.string,
			// If true, the user has 'purchased' the theme
			purchased: React.PropTypes.bool,
			// If true, highlight this theme as active
			active: React.PropTypes.bool,
			author: React.PropTypes.string,
			author_uri: React.PropTypes.string,
			demo_uri: React.PropTypes.string,
			stylesheet: React.PropTypes.string
		} ),
		// If true, render a placeholder
		isPlaceholder: React.PropTypes.bool,
		// URL the screenshot link points to
		screenshotClickUrl: React.PropTypes.string,
		// Called when theme screenshot is clicked
		onScreenshotClick: React.PropTypes.func,
		// Called when the more button is clicked
		onMoreButtonClick: React.PropTypes.func,
		// Options to populate the 'More' button popover menu with
		buttonContents: React.PropTypes.objectOf(
			React.PropTypes.shape( {
				label: React.PropTypes.string,
				header: React.PropTypes.string,
				action: React.PropTypes.func,
				getUrl: React.PropTypes.func
			} )
		),
		// Index of theme in results list
		index: React.PropTypes.number,
		// Label to show on screenshot hover.
		actionLabel: React.PropTypes.string
	},

	shouldComponentUpdate( nextProps ) {
		return ! isEqual( nextProps.theme, this.props.theme );
	},

	getDefaultProps() {
		return ( {
			isPlaceholder: false,
			buttonContents: {},
			onMoreButtonClick: noop,
			actionLabel: ''
		} );
	},

	onScreenshotClick() {
		this.props.onScreenshotClick( this.props.theme, this.props.index );
	},

	renderPlaceholder() {
		return (
			<Card className="theme is-placeholder">
				<div className="theme__content" />
			</Card>
		);
	},

	renderHover() {
		if ( this.props.screenshotClickUrl || this.props.onScreenshotClick ) {
			return (
				<a className="theme__active-focus"
					href={ this.props.screenshotClickUrl }
					onClick={ this.onScreenshotClick }>
					<span>
						{ this.props.actionLabel }
					</span>
				</a>
			);
		}
	},

	render() {
		const {
			name,
			active,
			price,
			purchased,
			screenshot
		} = this.props.theme;
		const themeClass = classNames( 'theme', {
			'is-active': active,
			'is-actionable': !! ( this.props.screenshotClickUrl || this.props.onScreenshotClick )
		} );

		// for performance testing
		const screenshotID = this.props.index === 0 ? 'theme__firstscreenshot' : null;

		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const screenshotWidth = window && window.devicePixelRatio > 1 ? 680 : 340;
		return (
			<Card className={ themeClass }>
				<div className="theme__content">
					{ this.renderHover() }
					<a href={ this.props.screenshotClickUrl }>
						{ screenshot
							? <img className="theme__img"
								src={ screenshot + '?w=' + screenshotWidth }
								onClick={ this.onScreenshotClick }
								id={ screenshotID }/>
							: <div className="theme__no-screenshot" >
								<Gridicon icon="themes" size={ 48 } />
							</div>
						}
					</a>
					<div className="theme__info" >
						<h2>{ name }</h2>
						{ active &&
							<span className="theme__active-label">{ this.translate( 'Active', {
								context: 'singular noun, the currently active theme'
							} ) }</span>
						}
						{ price && ! purchased &&
							<span className="price">{ price }</span>
						}
						{ ! isEmpty( this.props.buttonContents ) ? <ThemeMoreButton
							index={ this.props.index }
							theme={ this.props.theme }
							onClick={ this.props.onMoreButtonClick }
							options={ this.props.buttonContents } /> : null }
					</div>
				</div>
			</Card>
		);
	}
} );

export default Theme;
