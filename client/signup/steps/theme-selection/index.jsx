/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';

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

class ThemeSelectionStep extends Component {
	static propTypes = {
		designType: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		translate: PropTypes.func,
		useHeadstart: PropTypes.bool,
	};

	static defaultProps = {
		useHeadstart: true,
		translate: identity,
	};

	state = {
		showPressable: false,
	};

	pickTheme = ( theme ) => {
		const repoSlug = `${ theme.repo }/${ theme.slug }`;

		analytics.tracks.recordEvent( 'calypso_signup_theme_select', {
			theme: repoSlug,
			headstart: true
		} );

		SignupActions.submitSignupStep( {
			stepName: this.props.stepName,
			processingMessage: this.props.translate( 'Adding your theme' ),
			repoSlug
		}, null, {
			themeSlugWithRepo: repoSlug
		} );

		this.props.goToNextStep();
	};

	handleThemeUpload = () => {
		this.setState( {
			showPressable: true
		} );

		this.scrollUp();
	};

	renderThemesList() {
		const pressableWrapperClassName = classNames(
			'theme-selection__pressable-wrapper',
			{ 'is-hidden': ! this.state.showPressable }
		);

		const themesWrapperClassName = classNames(
			'theme-selection__themes-wrapper',
			{ 'is-hidden': this.state.showPressable }
		);

		return (
			<div className="theme-selection__pressable-substep-wrapper">
				<div className={ pressableWrapperClassName }>
					<PressableThemeStep
						{ ...this.props }
						onBackClick={ this.handleStoreBackClick }
					/>
				</div>
				<div className={ themesWrapperClassName }>
					<SignupThemesList
						className={ themesWrapperClassName }
						surveyQuestion={ this.props.chosenSurveyVertical }
						designType={ this.props.designType || this.props.signupDependencies.designType }
						handleScreenshotClick={ this.pickTheme }
						handleThemeUpload={ this.handleThemeUpload }
					/>
				</div>
			</div>
		);
	}

	renderJetpackButton() {
		return (
			<Button compact href="/jetpack/connect">
				{ this.props.translate( 'Or Install Jetpack on a Self-Hosted Site' ) }
			</Button>
		);
	}

	scrollUp() {
		// Didn't use setInterval in order to fix delayed scroll
		while ( window.pageYOffset > 0 ) {
			window.scrollBy( 0, -10 );
		}
	}

	handleStoreBackClick = () => {
		this.setState( {
			showPressable: false
		} );

		this.scrollUp();
	};

	render = () => {
		const defaultDependencies = this.props.useHeadstart ? { themeSlugWithRepo: 'pub/twentysixteen' } : undefined;
		const { translate } = this.props;

		const headerText = this.state.showPressable
			? translate( 'Upload your WordPress Theme' )
			: translate( 'Choose a theme.' );

		const subHeaderText = this.state.showPressable
			? translate( 'Our partner Pressable is here to help you', {
				context: 'Subheader text in Signup, when a user chooses the Upload theme in the Themes step'
			} )
			: translate( 'No need to overthink it. You can always switch to a different theme later.', {
				context: 'Themes step subheader in Signup'
			} );

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderThemesList() }
				defaultDependencies={ defaultDependencies }
				headerButton={ this.renderJetpackButton() }
				shouldHideNavButtons={ this.state.showPressable }
				{ ...this.props }
			/>
		);
	}
}

export default connect(
	( state ) => {
		return {
			chosenSurveyVertical: getSurveyVertical( state )
		};
	}
)( localize( ThemeSelectionStep ) );
