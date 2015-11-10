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
			section: undefined
		};
	},


	render: function() {
		var sectionClass = 'wp' + ( this.state.section || this.props.section ? ' is-section-' + this.state.section || this.props.section : '' );

		return (
						<div className={ sectionClass }>
							<Masterbar />
							<div id="content" className="wp-content">
								<div id="primary" className="wp-primary wp-section">
									<Main className="themes">
									{ this.props.primary }
									</Main>
								</div>
							</div>
							<div id="tertiary" className="wp-overlay fade-background">
								{ this.props.tertiary }
							</div>
						</div>
		);
	}
} );

module.exports = ThemesLoggedOutLayout;
