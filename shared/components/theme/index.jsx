/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classNames = require( 'classnames' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	ThemeMoreButton = require( './more-button' ),
	Gridicon = require( 'components/gridicon' ),
	isExternal = require( 'lib/url' ).isExternal;

/**
 * Component
 */
var Theme = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
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
		// If true, render a placeholder
		isPlaceholder: React.PropTypes.bool,
		// URL the screenshot link points to
		screenshotClickUrl: React.PropTypes.string,
		// Called when theme screenshot is clicked
		onScreenshotClick: React.PropTypes.func,
		// Called when the more button is clicked
		onMoreButtonClick: React.PropTypes.func,
		// Options to populate the 'More' button popover menu with
		buttonContents: React.PropTypes.arrayOf(
			React.PropTypes.shape( {
				label: React.PropTypes.string,
				action: React.PropTypes.func,
			} )
		),
		index: React.PropTypes.number
	},

	getDefaultProps: function() {
		return ( {
			isPlaceholder: false,
			buttonContents: [],
			onMoreButtonClick: noop
		} );
	},

	renderPlaceholder: function() {
		return (
			<Card className="theme is-placeholder">
				<div className="theme__content" />
			</Card>
		);
	},

	renderHover: function() {
		var actionLabel = '';

		if ( this.props.active ) {
			actionLabel = this.translate( 'Customize', {
				context: 'appears on hovering the active single theme thumbnail, opens the customizer'
			} );
		} else {
			actionLabel = this.translate( 'Preview', {
				context: 'appears on hovering a single theme thumbnail, opens the theme demo site preview'
			} );
		}

		if ( this.props.screenshotClickUrl || this.props.onScreenshotClick ) {
			return (
				<a className="theme__active-focus"
					onClick={ this.props.onScreenshotClick }>
					<span>
						{ actionLabel }
					</span>
				</a>
			);
		}
	},

	render: function() {
		var themeClass = classNames( 'theme', {
			'is-active': this.props.active,
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
						{ this.props.screenshot ?
							<img className="theme__img"
								src={ this.props.screenshot + '?w=' + screenshotWidth }
								onClick={ this.props.onScreenshotClick }
								id={ screenshotID }/> :
							<div className="theme__no-screenshot" >
								<Gridicon icon="themes" size={ 48 } />
							</div>
						}
					</a>
					<div className="theme__info" >
						<h2>{ this.props.name }</h2>
						{ this.props.active &&
							<span className="theme__active-label">{ this.translate( 'Active', {
								context: 'singular noun, the currently active theme'
							} ) }</span>
						}
						{ this.props.price && ! this.props.purchased &&
							<span className="price">{ this.props.price }</span>
						}
						{ this.props.purchased && ! this.props.active &&
							<span className="price">{ this.translate( 'Purchased' ) }</span>
						}
						{ this.props.buttonContents.length ? <ThemeMoreButton id={ this.props.id }
							onClick={ this.props.onMoreButtonClick }
							price={ this.props.price }
							purchased={ this.props.purchased }
							options={ this.props.buttonContents }
							active={ this.props.active } /> : null }
					</div>
				</div>
			</Card>
		);
	}
} );

module.exports = Theme;
