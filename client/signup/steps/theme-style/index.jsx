/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';
import SignupThemeStyleList from './signup-theme-style-list';
import StepWrapper from 'signup/step-wrapper';
import Button from 'components/button';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';

class ThemeStyleStep extends Component {
	static propTypes = {
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	pickThemeStyle = themeStyle => {
		analytics.tracks.recordEvent( 'calypso_signup_theme_style_select', {
			themeStyle,
		} );

		SignupActions.submitSignupStep(
			{
				stepName: this.props.stepName,
				processingMessage: this.props.translate( 'Styling your site.' ),
				themeStyle,
			},
			null,
			{
				themeStyle,
			}
		);

		this.props.goToNextStep();
	};

	renderThemeStyleList() {
		return (
			<SignupThemeStyleList
				theme={ this.props.signupDependencies.themeSlugWithRepo }
				handleScreenshotClick={ this.pickThemeStyle }
			/>
		);
	}

	renderJetpackButton() {
		return (
			<Button compact href="/jetpack/connect">
				{ this.props.translate( 'Or Install Jetpack on a Self-Hosted Site' ) }
			</Button>
		);
	}

	render = () => {
		const { translate } = this.props;
		const headerText = translate( 'Choose a style for your website.' );
		const subHeaderText = translate( "Don't worry, you can change this later." );
		const defaultDependencies = { themeSlugWithRepo: 'pub/radcliffe-2' };

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderThemeStyleList() }
				defaultDependencies={ defaultDependencies }
				headerButton={ this.renderJetpackButton() }
				{ ...this.props }
			/>
		);
	};
}

export default connect( state => ( {
	dependencyStore: getSignupDependencyStore( state ),
} ) )( localize( ThemeStyleStep ) );
