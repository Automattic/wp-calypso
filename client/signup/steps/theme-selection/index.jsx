/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';
import SignupThemesList from './signup-themes-list';
import StepWrapper from 'signup/step-wrapper';
import ThemePreview from 'my-sites/themes/theme-preview';
import Button from 'components/button';
import config from 'config';

const themeDemosEnabled = config.isEnabled( 'signup/theme-demos' );

module.exports = React.createClass( {
	displayName: 'ThemeSelection',

	propTypes: {
		useHeadstart: React.PropTypes.bool,
		stepName: React.PropTypes.string.isRequired,
		goToNextStep: React.PropTypes.func.isRequired,
		signupDependencies: React.PropTypes.object.isRequired,
	},

	getInitialState() {
		return {
			previewTheme: {},
			isPreviewVisible: false,
		};
	},

	getDefaultProps() {
		return {
			useHeadstart: true,
		};
	},

	pickTheme( theme ) {
		const themeSlug = theme.id;

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

	showPreview( theme ) {
		this.setState( {
			previewTheme: theme,
			isPreviewVisible: true,
		} );
	},

	handleThemePreviewButtonClick() {
		this.pickTheme( this.state.previewTheme );
	},

	handleThemePreviewCloseClick() {
		this.setState( {
			previewTheme: {},
			isPreviewVisible: false,
		} );
	},

	handleScreenshotClick( theme ) {
		if ( themeDemosEnabled ) {
			this.showPreview( theme );
		} else {
			this.pickTheme( theme );
		}
	},

	renderThemesList() {
		return ( <SignupThemesList
			surveyQuestion={ this.props.signupDependencies.surveyQuestion }
			designType={ this.props.signupDependencies.designType }
			handleScreenshotClick={ this.handleScreenshotClick }
		/> );
	},

	renderJetpackButton() {
		return (
			<Button compact href="/jetpack/connect">{ this.translate( 'Or Install Jetpack on a Self-Hosted Site' ) }</Button>
		);
	},

	renderThemePreview() {
		return (
			<ThemePreview
				showPreview={ this.state.isPreviewVisible }
				showExternal={ false }
				theme={ this.state.previewTheme }
				primaryButtonLabel={ this.translate( 'Pick this Theme' ) }
				onClose={ this.handleThemePreviewCloseClick }
				onPrimaryButtonClick={ this.handleThemePreviewButtonClick }>
			</ThemePreview>
		);
	},

	renderStepContent() {
		return (
			<div>
				{ this.renderThemesList() }
				{ this.renderThemePreview() }
			</div>
		);
	},

	render() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentysixteen' } : undefined;
		return (
			<StepWrapper
				fallbackHeaderText={ this.translate( 'Choose a theme.' ) }
				fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme later.' ) }
				subHeaderText={ this.translate( 'Choose a theme. You can always switch to a different theme later.' ) }
				stepContent={ this.renderStepContent() }
				defaultDependencies={ defaultDependencies }
				headerButton={ this.renderJetpackButton() }
				{ ...this.props } />
		);
	}
} );
