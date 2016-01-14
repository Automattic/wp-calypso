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
	StepWrapper = require( 'signup/step-wrapper' );

module.exports = React.createClass( {
	displayName: 'ThemeSelection',

	propTypes: {
		themes: React.PropTypes.arrayOf( React.PropTypes.shape( {
			name: React.PropTypes.string.isRequired,
			slug: React.PropTypes.string.isRequired
		} ) ),
		useHeadstart: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			themes: [
				{ name: 'Boardwalk', slug: 'boardwalk' },
				{ name: 'Cubic', slug: 'cubic' },
				{ name: 'Edin', slug: 'edin' },
				{ name: 'Cols', slug: 'cols' },
				{ name: 'Minnow', slug: 'minnow' },
				{ name: 'Sequential', slug: 'sequential' },
				{ name: 'Penscratch', slug: 'penscratch' },
				{ name: 'Intergalactic', slug: 'intergalactic' },
				{ name: 'Eighties', slug: 'eighties' },
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

	getThemes() {
		return this.props.signupDependencies.themes || this.props.themes;
	},

	renderThemesList: function() {
		var actionLabel = this.translate( 'Pick' ),
			themes = this.getThemes().map( function( theme ) {
				return {
					id: theme.slug,
					name: theme.name,
					screenshot: 'https://i1.wp.com/s0.wp.com/wp-content/themes/pub/' + theme.slug + '/screenshot.png?w=660'
				}
			} );
		return (
			<ThemesList
				getButtonOptions= { noop }
				onScreenshotClick= { this.handleScreenshotClick }
				onMoreButtonClick= { noop }
				getActionLabel={ function() {
					return actionLabel;
				} }
				{ ...this.props }
				themes= { themes } />
		);
	},

	render: function() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentyfifteen', images: null } : undefined;
		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Choose a theme.' ) }
				fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme later.' ) }
				subHeaderText={ this.translate( 'Choose a theme. You can always switch to a different theme later.' ) }
				stepContent={ this.renderThemesList() }
				defaultDependencies={ defaultDependencies }
				{ ...this.props } />
		);
	}
} );
