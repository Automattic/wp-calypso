/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';
import SignupThemesList from './signup-themes-list';
import PressableThemeStep from './pressable-theme';
import StepWrapper from 'signup/step-wrapper';
import Button from 'components/button';

import { getSurveyVertical } from 'state/signup/steps/survey/selectors';

const ThemeSelectionStep = React.createClass( {
	displayName: 'ThemeSelection',

	propTypes: {
		designType: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		useHeadstart: PropTypes.bool,
	},

	getInitialState() {
		return {
			showPressable: false,
		};
	},

	getDefaultProps() {
		return {
			useHeadstart: true,
		};
	},

	pickTheme( theme ) {
		const repoSlug = `${ theme.repo }/${ theme.slug }`;

		analytics.tracks.recordEvent( 'calypso_signup_theme_select', {
			theme: repoSlug,
			headstart: true
		} );

		SignupActions.submitSignupStep( {
			stepName: this.props.stepName,
			processingMessage: this.translate( 'Adding your theme' ),
			repoSlug
		}, null, {
			theme: repoSlug
		} );

		this.props.goToNextStep();
	},

	handleScreenshotClick( theme ) {
		this.pickTheme( theme );
	},

	handleThemeUpload() {
		this.setState( {
			showPressable: true
		} );

		this.scrollUp();
	},

	renderThemesList() {
		return (
			<SignupThemesList
				surveyQuestion={ this.props.chosenSurveyVertical }
				designType={ this.props.designType || this.props.signupDependencies.designType }
				handleScreenshotClick={ this.handleScreenshotClick }
				handleThemeUpload={ this.handleThemeUpload }
			/>
		);
	},

	renderJetpackButton() {
		return (
			<Button compact href="/jetpack/connect">{ this.translate( 'Or Install Jetpack on a Self-Hosted Site' ) }</Button>
		);
	},

	scrollUp() {
		// Didn't use setInterval in order to fix delayed scroll
		while ( window.pageYOffset > 0 ) {
			window.scrollBy( 0, -10 );
		}
	},

	handleStoreBackClick() {
		this.setState( {
			showPressable: false
		} );

		this.scrollUp();
	},

	render() {
		const defaultDependencies = this.props.useHeadstart ? { theme: 'pub/twentysixteen' } : undefined;

		const pressableWrapperClassName = classNames( {
			'theme-selection__pressable-wrapper': true,
			'is-hidden': ! this.state.showPressable,
		} );

		const themesWrapperClassName = classNames( {
			'theme-selection__themes-wrapper': true,
			'is-hidden': this.state.showPressable,
		} );

		return (
			<div>
				<div className={ pressableWrapperClassName } >
					<PressableThemeStep
						{ ... this.props }
						onBackClick={ this.handleStoreBackClick }
					/>
				</div>
				<div className={ themesWrapperClassName } >
					<StepWrapper
						fallbackHeaderText={ this.translate( 'Choose a theme.' ) }
						fallbackSubHeaderText={ this.translate( 'No need to overthink it. You can always switch to a different theme later.' ) }
						subHeaderText={ this.translate( 'Choose a theme. You can always switch to a different theme later.' ) }
						stepContent={ this.renderThemesList() }
						defaultDependencies={ defaultDependencies }
						headerButton={ this.renderJetpackButton() }
						{ ...this.props } />
					</div>
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		return {
			chosenSurveyVertical: getSurveyVertical( state )
		};
	}
)( ThemeSelectionStep );
