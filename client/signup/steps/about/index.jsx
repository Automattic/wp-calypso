/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { setDesignType } from 'state/signup/steps/design-type/actions';
import Card from 'components/card';
import Button from 'components/button';

class AboutStep extends Component {
	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, translate } = this.props;

		//Replace with user inputs
		const siteName = 'Site name';
		const themeRepo = 'pub/radcliffe-2';
		const designType = 'blog';

		this.props.setSiteTitle( siteName );
		this.props.setDesignType( designType );

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
				themeRepo,
				siteName,
			},
			[],
			{ themeSlugWithRepo: themeRepo, siteTitle: siteName }
		);

		goToNextStep();
	};

	renderContent() {
		const { translate } = this.props;

		return (
			<div>
				<Card>Form contents will go here.</Card>
				<form onSubmit={ this.handleSubmit }>
					<Button primary={ true } type="submit">
						{ translate( 'Continue' ) }
					</Button>
				</form>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ translate( 'Let’s create a site' ) }
				subHeaderText={ translate(
					'Please answer these questions so we can help you make the site you need.'
				) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect( null, { setSiteTitle, setDesignType } )( localize( AboutStep ) );
