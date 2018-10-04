/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, identity } from 'lodash';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import SignupActions from 'lib/signup/actions';
import SignupThemesList from './signup-themes-list';
import StepWrapper from 'signup/step-wrapper';
import Button from 'components/button';
import { themes } from 'lib/signup/themes-data';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSurveyVertical } from 'state/signup/steps/survey/selectors';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { isEnabled } from 'config';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';

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

	pickTheme = themeId => {
		const theme = find( themes, { slug: themeId } );
		const repoSlug = `${ theme.repo }/${ theme.slug }`;

		analytics.tracks.recordEvent( 'calypso_signup_theme_select', {
			theme: repoSlug,
			headstart: true,
		} );

		SignupActions.submitSignupStep(
			{
				stepName: this.props.stepName,
				processingMessage: this.props.translate( 'Adding your theme' ),
				repoSlug,
			},
			null,
			{
				themeSlugWithRepo: repoSlug,
			}
		);

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

	isStoreSignup() {
		const { signupDependencies = {} } = this.props;

		return (
			isEnabled( 'signup/atomic-store-flow' ) &&
			( this.props.designType === 'store' || signupDependencies.designType === 'store' )
		);
	}

	render = () => {
		const storeSignup = this.isStoreSignup();
		const defaultDependencies = this.props.useHeadstart
			? { themeSlugWithRepo: 'pub/twentysixteen' }
			: undefined;
		const { translate } = this.props;
		const headerText = storeSignup
			? translate( 'Choose a store theme.' )
			: translate( 'Choose a theme.' );
		const subHeaderText = storeSignup
			? translate( 'Pick one of our store themes to start with. You can change this later.', {
					context: 'Themes step subheader in Signup',
			  } )
			: translate(
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
	};
}

export default connect( ( state, props ) => ( {
	chosenSurveyVertical: getSurveyVertical( state ),
	currentUser: getCurrentUser( state ),
	designType: props.designType || getDesignType( state ),
	dependencyStore: getSignupDependencyStore( state ),
} ) )( localize( ThemeSelectionStep ) );
