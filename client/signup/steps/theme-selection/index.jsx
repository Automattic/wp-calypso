import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { themes } from 'calypso/lib/signup/themes-data';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { getSurveyVertical } from 'calypso/state/signup/steps/survey/selectors';
import SignupThemesList from './signup-themes-list';
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

		return this.props.designType === 'store' || signupDependencies.designType === 'store';
	}

	headerText() {
		const { translate } = this.props;

		if ( this.isStoreSignup() ) {
			return translate( 'Choose a store theme.' );
		}

		return translate( 'Choose a theme.' );
	}

	subHeaderText() {
		const { translate } = this.props;

		if ( this.isStoreSignup() ) {
			return translate( 'Pick one of our store themes to start with. You can change this later.', {
				context: 'Themes step subheader in Signup',
			} );
		}

		return translate(
			'Pick one of our popular themes to get started or choose from hundreds more after you sign up.',
			{ context: 'Themes step subheader in Signup' }
		);
	}

	render() {
		const { useHeadstart, flowName } = this.props;

		// If a user skips the step in `design-first`, let segment and vertical determine content.
		const defaultDependencies =
			'design-first' === flowName
				? { themeSlugWithRepo: 'pub/maywood', useThemeHeadstart: false }
				: { themeSlugWithRepo: 'pub/twentysixteen', useThemeHeadstart: useHeadstart };

		const headerText = this.headerText();
		const subHeaderText = this.subHeaderText();

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
	( state, props ) => ( {
		chosenSurveyVertical: getSurveyVertical( state ),
		currentUser: getCurrentUser( state ),
		designType: props.designType || getDesignType( state ),
		dependencyStore: getSignupDependencyStore( state ),
	} ),
	{ submitSignupStep }
)( localize( ThemeSelectionStep ) );
