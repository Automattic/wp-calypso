/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find, identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SignupThemesList from './signup-themes-list';
import Button from 'components/button';
import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';
import { themes } from 'lib/signup/themes-data';
import StepWrapper from 'signup/step-wrapper';
import { getCurrentUser } from 'state/current-user/selectors';
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

	pickTheme = ( themeId ) => {
		const theme = find( themes, { slug: themeId } );
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

	renderThemesList() {
		return (
			<SignupThemesList
				surveyQuestion={ this.props.chosenSurveyVertical }
				designType={ this.props.designType || this.props.signupDependencies.designType }
				handleScreenshotClick={ this.pickTheme }
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
		const defaultDependencies = this.props.useHeadstart ? { themeSlugWithRepo: 'pub/twentysixteen' } : undefined;
		const { translate } = this.props;
		const headerText = translate( 'Choose a theme.' );
		const subHeaderText = translate(
			'Pick one of our popular themes to get started or choose from hundreds more after you sign up.',
			{ context: 'Themes step subheader in Signup' }
		);

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderThemesList() }
				defaultDependencies={ defaultDependencies }
				headerButton={ this.renderJetpackButton() }
				{ ...this.props }
			/>
		);
	}
}

export default connect(
	( state ) => ( {
		chosenSurveyVertical: getSurveyVertical( state ),
		currentUser: getCurrentUser( state )
	} )
)( localize( ThemeSelectionStep ) );
