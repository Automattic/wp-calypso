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
import { recordTracksEvent } from 'lib/analytics/tracks';
import SignupThemesList from './signup-themes-list';
import StepWrapper from 'signup/step-wrapper';
import { Button } from '@automattic/components';
import { themes } from 'lib/signup/themes-data';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSurveyVertical } from 'state/signup/steps/survey/selectors';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { isEnabled } from 'config';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

class ThemeSelectionStep extends Component {
	static propTypes = {
		designType: PropTypes.string,
		quantity: PropTypes.number,
		goToNextStep: PropTypes.func.isRequired,
		signupDependencies: PropTypes.object.isRequired,
		stepName: PropTypes.string.isRequired,
		useHeadstart: PropTypes.bool,
		translate: PropTypes.func,
	};

	static defaultProps = {
		useHeadstart: true,
		translate: identity,
	};

	pickTheme = ( themeId ) => {
		const { useHeadstart } = this.props;
		const theme = find( themes, { slug: themeId } );
		const repoSlug = `${ theme.repo }/${ theme.slug }`;

		recordTracksEvent( 'calypso_signup_theme_select', {
			theme: repoSlug,
			headstart: useHeadstart,
		} );

		this.props.submitSignupStep(
			{
				stepName: this.props.stepName,
				repoSlug,
			},
			{
				themeSlugWithRepo: repoSlug,
				useThemeHeadstart: useHeadstart,
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
				quantity={ this.props.quantity }
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

	headerText() {
		const { flowName, translate } = this.props;

		if ( this.isStoreSignup() ) {
			return translate( 'Choose a store theme.' );
		} else if ( flowName === 'test-fse' ) {
			return translate( 'Pick your site design' );
		}
		return translate( 'Choose a theme.' );
	}

	headerTextIfFirstStep() {
		const { flowName, translate } = this.props;

		if ( flowName === 'test-fse' ) {
			return translate( "Let's get started by picking your site design" );
		}

		// Use the default header text
		return undefined;
	}

	subHeaderText() {
		const { flowName, translate } = this.props;

		if ( this.isStoreSignup() ) {
			return translate( 'Pick one of our store themes to start with. You can change this later.', {
				context: 'Themes step subheader in Signup',
			} );
		} else if ( flowName === 'test-fse' ) {
			return translate( "You'll be able to customize your new site in hundreds of ways." );
		}
		return translate(
			'Pick one of our popular themes to get started or choose from hundreds more after you sign up.',
			{ context: 'Themes step subheader in Signup' }
		);
	}

	render() {
		const { useHeadstart, flowName } = this.props;

		// If a user skips the step in `design-first` or `test-fse` let segment and vertical determine content.
		const defaultDependencies =
			'design-first' === flowName || 'test-fse' === flowName
				? { themeSlugWithRepo: 'pub/maywood', useThemeHeadstart: false }
				: { themeSlugWithRepo: 'pub/twentysixteen', useThemeHeadstart: useHeadstart };

		const headerText = this.headerText();
		const headerTextIfFirstStep = this.headerTextIfFirstStep();
		const subHeaderText = this.subHeaderText();

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				headerText={ headerTextIfFirstStep }
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
	( state, props ) => ( {
		chosenSurveyVertical: getSurveyVertical( state ),
		currentUser: getCurrentUser( state ),
		designType: props.designType || getDesignType( state ),
		dependencyStore: getSignupDependencyStore( state ),
	} ),
	{ submitSignupStep }
)( localize( ThemeSelectionStep ) );
