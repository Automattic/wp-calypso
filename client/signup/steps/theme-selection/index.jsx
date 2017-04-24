/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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
import { themes } from 'lib/signup/themes-data';
import { abtest } from 'lib/abtest';

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
				handleScreenshotClick={ this.pickTheme } />
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
		let headerText = translate( 'Choose a theme.' );
		let subHeaderText = translate(
			'No need to overthink it. You can always switch to a different theme later.',
			{ context: 'Themes step subheader in Signup' }
		);

		if ( abtest( 'signupThemeStepCopyChanges' ) === 'modified' ) {
			let siteType = this.props.signupDependencies.designType;

			switch ( siteType ) {
				case 'blog':
					siteType = 'blog';
					break;
				case 'grid':
					siteType = 'portfolio';
					break;
				case 'page':
					siteType = 'website';
					break;
				case undefined:
					siteType = '';
					break;
				default:
					siteType = 'website';
			}

			// Note: Don't make this translatable because it's only visible to English-language users
			headerText = 'Here are our most popular ' + siteType + ' designs.';
			subHeaderText = 'Pick one of these to get started or choose from hundreds more once your account is created.';
		}

		return (
			<StepWrapper
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				subHeaderText={ subHeaderText }
				stepContent={ this.renderThemesList() }
				defaultDependencies={ defaultDependencies }
				headerButton={ this.renderJetpackButton() }
				{ ...this.props } />
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
