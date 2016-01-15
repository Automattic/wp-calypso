/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	SignupActions = require( 'lib/signup/actions' );

module.exports = React.createClass( {
	displayName: 'ThemeThumbnail',

	propTypes: {
		themeName: React.PropTypes.string.isRequired,
		themeSlug: React.PropTypes.string.isRequired,
	},

	handleSubmit: function() {
		var themeSlug = this.props.themeSlug;

		if ( true === this.props.useHeadstart && themeSlug ) {
			analytics.tracks.recordEvent( 'calypso_signup_theme_select', { theme: themeSlug, headstart: true } );

			SignupActions.submitSignupStep( { stepName: this.props.stepName }, null, {
				theme: 'pub/' + themeSlug,
				images: undefined
			} );
		} else {
			analytics.tracks.recordEvent( 'calypso_signup_theme_select', { theme: themeSlug, headstart: false } );

			SignupActions.submitSignupStep( {
				stepName: this.props.stepName,
				processingMessage: this.translate( 'Adding your theme' ),
				themeSlug
			} );
		}

		this.props.goToNextStep();
	},

	getThumbnailUrl: function() {
		return 'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + this.props.themeSlug + '/screenshot.png?w=660';
	},

	render: function() {
		return (
			<div onClick={ this.handleSubmit } className="theme-thumbnail__theme">
				<img src={ this.getThumbnailUrl() } />
				<span className="theme-thumbnail__name">{ this.props.themeName }</span>
			</div>
		);
	}
} );
