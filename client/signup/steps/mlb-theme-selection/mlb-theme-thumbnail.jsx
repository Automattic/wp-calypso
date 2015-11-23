/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	SignupActions = require( 'lib/signup/actions' ),
	ThemeHelper = require( 'lib/themes/helpers' );

module.exports = React.createClass( {
	displayName: 'MlbThemeThumbnail',

	handleSubmit: function() {
		var themeSlug;
		if ( this.props.team === 'mlb' ) {
      themeSlug = 'partner-mlb-' + ThemeHelper.getSlugFromName( this.props.variation );
		} else {
			themeSlug = "vip/" + ThemeHelper.getSlugFromName( this.props.variation ) + '/' + this.props.team;
		}

		analytics.tracks.recordEvent( 'calypso_signup_theme_select', { theme: themeSlug, headstart: false } );
		SignupActions.submitSignupStep( {
			stepName: this.props.stepName,
			processingMessage: this.translate( 'Adding your theme' ),
			themeSlug
		} );

		this.props.goToNextStep();
	},

	getThumbnailUrl: function() {
		var url = 'https://i1.wp.com/s0.wp.com/wp-content/themes/vip/partner-' +
			this.props.team + '-' + ThemeHelper.getSlugFromName( this.props.variation ) + '/screenshot.png?w=660';
		if ( this.props.team !== 'mlb' ) {
			url = 'https://signup.wordpress.com/wp-content/mu-plugins/signup-variants/mlblogs/images/themes/' +
				ThemeHelper.getSlugFromName( this.props.variation ) + '/' + this.props.team + '.jpg';
		}
		return url;
	},

	render: function() {
		return (
			<div onClick={ this.handleSubmit } className="theme-thumbnail__theme">
				<img src={ this.getThumbnailUrl() } />
				<span className="theme-thumbnail__name">{ this.props.variation }</span>
			</div>
		);
	}
} );
