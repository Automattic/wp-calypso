/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var  Masterbar = require( './masterbar' ),
//	NoticesList = require( 'notices/notices-list' ),
//	notices = require( 'notices' ),
//	title = require( 'lib/screen-title' ),
	Main = require( 'components/main' ),
	sanitize = require( 'sanitize' );

var ThemesLoggedOutLayout = React.createClass( {
	getInitialState: function() {
		return {
			section: this.props.section,
			primary: this.props.primary,
			tertiary: this.props.tertiary
		};
	},


	render: function() {
		var sectionClass = 'wp' + ( this.state.section ? ' is-section-' + this.state.section : '' );

		return (
						<div className={ sectionClass }>
							<Masterbar />
							<div id="content" className="wp-content">
								<div id="primary" className="wp-primary wp-section">
									<Main className="themes">
									{ this.state.primary }
									</Main>
								</div>
							</div>
							<div id="tertiary" className="wp-overlay fade-background">
								{ this.state.tertiary }
							</div>
						</div>
		);
	}
} );

module.exports = ThemesLoggedOutLayout;
