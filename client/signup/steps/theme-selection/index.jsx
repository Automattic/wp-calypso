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
import getThemes from 'lib/signup/themes';
import ThemesList from 'components/themes-list';
import StepWrapper from 'signup/step-wrapper';
import Button from 'components/button';

module.exports = React.createClass( {
	displayName: 'ThemeSelection',

	propTypes: {
		useHeadstart: React.PropTypes.bool,
	},

	getDefaultProps() {
		return {
			useHeadstart: true,
		};
	},

	getInitialState() {
		return {
			themes: this.getThemes()
		};
	},

	componentWillReceiveProps( nextProps ) {
		const { surveyQuestion, designType } = nextProps.signupDependencies;
		if ( surveyQuestion !== this.props.signupDependencies.surveyQuestion || designType !== this.props.signupDependencies.designType ) {
			this.setState( { themes: this.getThemes() } );
		}
	},

	getThemes() {
		return getThemes( this.props.signupDependencies.surveyQuestion, this.props.signupDependencies.designType );
	},

	handleScreenshotClick( theme ) {
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

	renderThemesList() {
		var actionLabel = this.translate( 'Pick' ),
			themes = this.state.themes.map( function( theme ) {
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

	render() {
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
