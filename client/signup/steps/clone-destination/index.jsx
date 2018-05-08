/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import Card from 'components/card';
import Button from 'components/button';
import SignupActions from 'lib/signup/actions';
import FormTextInput from 'components/forms/form-text-input';

class CloneDestinationStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
		signupDependencies: PropTypes.object,
	};

	state = {
		form: {
			destinationSiteName: '',
			destinationSiteUrl: '',
		},
	};

	handleFieldChange = ( { target: { name, value } } ) =>
		this.setState( {
			form: Object.assign( this.state.form, { [ name ]: value } ),
		} );

	goToNextStep = () => {
		const { form: { siteName, siteUrl } } = this.state;

		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {
			destinationSiteName: siteName,
			destinationSiteUrl: siteUrl,
		} );

		this.props.goToNextStep();
	};

	renderStepContent = () => {
		const { translate } = this.props;

		return (
			<Card className="clone-destination__card">
				<img
					alt="upgrade"
					className="clone-destination__image"
					src="/calypso/images/upgrades/thank-you.svg"
				/>
				<p className="clone-destination__description">{ translate( "Let's get started." ) }</p>
				<p className="clone-destination__description">
					{ translate( 'First, what would you like to name your destination site?' ) }
				</p>
				<FormTextInput name="siteName" onChange={ this.handleFieldChange } />
				<p className="clone-destination__description">
					{ translate( 'Second, what is the public URL that it will be available at?' ) }
				</p>
				<FormTextInput name="siteUrl" onChange={ this.handleFieldChange } />
				<p className="clone-destination__tos">
					{ translate( 'By continuing, you agree to our Terms of Service.' ) }
				</p>
				<Button primary className="clone-destination__button" onClick={ this.goToNextStep }>
					{ translate( 'Continue' ) }
				</Button>
			</Card>
		);
	};

	render() {
		const { flowName, stepName, positionInFlow, signupProgress, translate } = this.props;

		const headerText = translate( 'Getting started' );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				positionInFlow={ positionInFlow }
				signupProgress={ signupProgress }
				stepContent={ this.renderStepContent() }
			/>
		);
	}
}

export default localize( CloneDestinationStep );
