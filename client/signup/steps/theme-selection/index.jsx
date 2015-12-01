/**
 * External dependencies
 */
var React = require( 'react' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	SignupActions = require( 'lib/signup/actions' ),
	ThemesList = require( 'components/themes-list' ),
	ThemeHelper = require( 'lib/themes/helpers' ),
	StepWrapper = require( 'signup/step-wrapper' );

module.exports = React.createClass( {
	displayName: 'ThemeSelection',

	getDefaultProps: function() {
		return {
			themes: [
				'Boardwalk',
				'Cubic',
				'Edin',
				'Cols',
				'Minnow',
				'Sequential',
				'Penscratch',
				'Intergalactic',
				'Eighties'
			],

			useHeadstart: false
		};
	},

	handleScreenshotClick: function( theme ) {
		var themeSlug = theme.id;

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

	renderThemesList: function() {
		var actionLabel = this.translate( 'Pick' ),
			themes = this.props.themes.map( function( theme ) {
				return {
					id: ThemeHelper.getSlugFromName( theme ),
					name: theme,
					screenshot: 'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + ThemeHelper.getSlugFromName( theme ) + '/screenshot.png?w=660',
					actionLabel: actionLabel
				}
			} );
		return (
			<ThemesList
				getButtonOptions= { noop }
				onScreenshotClick= { this.handleScreenshotClick }
				onMoreButtonClick= { noop }
				{ ...this.props }
				themes= { themes } />
		);
	},

	render: function() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentyfifteen', images: null } : undefined;
		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Choose a theme.' ) }
				fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme\u00a0later.' ) }
				subHeaderText={ this.translate( 'Choose a theme. You can always switch to a different theme\u00a0later.' ) }
				stepContent={ this.renderThemesList() }
				defaultDependencies={ defaultDependencies }
				{ ...this.props } />
		);
	}
} );
