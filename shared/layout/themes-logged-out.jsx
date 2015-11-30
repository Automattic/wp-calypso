/**
 * External dependencies
 */
var React = require( 'react' ),
	partialRight = require( 'lodash/function/partialRight' );

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

	// TODO: Solution that allows rendering full layout appropriate to current route
	getDefaultProps: function() {
		const themesComponent = require( 'my-sites/themes/themes-selection' );
		const getButtonOptions = require( 'my-sites/themes/theme-options' );
		const themes = React.createFactory( themesComponent );

		return {
			section: 'themes',
			primary: themes( {
				getOptions: partialRight( getButtonOptions, () => {}, () => {} ),
				sites: false,
				setSelectedTheme: () => {},
				togglePreview: () => {},
				secondary: null,
				tertiary: null
			} )
		};
	},

	render: function() {
		var sectionClass = 'wp' + ( this.props.section ? ' is-section-' + this.props.section : '' );
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
