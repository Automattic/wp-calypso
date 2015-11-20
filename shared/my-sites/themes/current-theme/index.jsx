/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Helpers = require( 'lib/themes/helpers' ),
	CurrentThemeButton = require( './button' );

/**
 * Show current active theme for a site, with
 * related actions.
 */
var CurrentTheme = React.createClass( {

	propTypes: {
		currentTheme: React.PropTypes.object,
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		canCustomize: React.PropTypes.bool.isRequired
	},

	trackClick: Helpers.trackClick.bind( null, 'current theme' ),

	render: function() {
		var currentTheme = this.props.currentTheme,
			placeholderText = <span className="current-theme__placeholder">loading...</span>,
			text = currentTheme ? currentTheme.name : placeholderText,
			site = this.props.site;

		return (
			<Card className="current-theme">
				<div className="current-theme__info">
					<span className="current-theme__label">
						{ this.translate( 'Current Theme' ) }
					</span>
					<span className="current-theme__name">
						{ text }
					</span>
				</div>
				<div className={ classNames(
					'current-theme__actions',
					{ 'two-buttons': site.jetpack }
					) } >
					<CurrentThemeButton name="customize"
						label={ this.translate( 'Customize' ) }
						noticon="paintbrush"
						href={ this.props.canCustomize ? Helpers.getCustomizeUrl( null, site ) : null }
						onClick={ this.trackClick } />
					<CurrentThemeButton name="details"
						label={ this.translate( 'Details' ) }
						noticon="info"
						href={ currentTheme ? Helpers.getDetailsUrl( currentTheme, site ) : null }
						onClick={ this.trackClick } />
					{ ! site.jetpack && <CurrentThemeButton name="support"
						label={ this.translate( 'Support' ) }
						noticon="help"
						href={ currentTheme ? Helpers.getSupportUrl( currentTheme, site ) : null }
						onClick={ this.trackClick } /> }
				</div>
			</Card>
		);
	}
} );

module.exports = CurrentTheme;

