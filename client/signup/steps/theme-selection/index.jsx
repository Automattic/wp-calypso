/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';
import ThemesList from 'components/themes-list';
import StepWrapper from 'signup/step-wrapper';
import Button from 'components/button';

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
				{ name: 'Dyad', slug: 'dyad' },
				{ name: 'Independent Publisher', slug: 'independent-publisher' },
				{ name: 'Sela', slug: 'sela' },
				{ name: 'Hemingway Rewritten', slug: 'hemingway-rewritten' },
				{ name: 'Twenty Sixteen', slug: 'twentysixteen' },
				{ name: 'Penscratch', slug: 'penscratch' },
				{ name: 'Edin', slug: 'edin' },
				{ name: 'Publication', slug: 'publication' },
				{ name: 'Harmonic', slug: 'harmonic' },
			],

			useHeadstart: true,
		};
	},

	handleScreenshotClick: function( theme ) {
		var themeSlug = theme.id;

		analytics.tracks.recordEvent( 'calypso_signup_theme_select', { theme: themeSlug, headstart: true } );

		SignupActions.submitSignupStep( {
			stepName: this.props.stepName,
			processingMessage: this.translate( 'Adding your theme' ),
			themeSlug
		}, null, {
			theme: 'pub/' + themeSlug
		} );

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
				};
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

	renderJetpackButton() {
		return (
			<Button compact href="/jetpack/connect">{ this.translate( 'Or Install Jetpack on a Self-Hosted Site' ) }</Button>
		);
	},

	render: function() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentysixteen' } : undefined;
		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Choose a theme.' ) }
				fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme later.' ) }
				subHeaderText={ this.translate( 'Choose a theme. You can always switch to a different theme later.' ) }
				stepContent={ this.renderThemesList() }
				defaultDependencies={ defaultDependencies }
				headerButton={ this.renderJetpackButton() }
				{ ...this.props } />
		);
	}
} );
