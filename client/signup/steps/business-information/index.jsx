/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { isUserLoggedIn } from 'state/current-user/selectors';

//Form components
import Card from 'components/card';
import Button from 'components/button';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';

class BusinessInformation extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			businessInformation: '',
		};
	}

	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, flowName, translate } = this.props;

		//Create site
		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
			},
			[],
			{
				businessInformation: 'boom',
			}
		);

		goToNextStep( flowName );
	};

	renderContent() {
		const { translate } = this.props;

		return (
			<div className="business-information__wrapper">
				<div className="business-information__form-wrapper ">
					<form onSubmit={ this.handleSubmit }>
						<Card>
							<h3>{ translate( 'Basic Information' ) }</h3>
							{ translate( 'How do people find and contact your business?' ) }

							<FormFieldset>
								<FormTextInput
									id="name"
									name="name"
									placeholder={ translate( 'Business Name' ) }
									//onChange={ this.handleChangeEvent }
								/>
								<FormLabel htmlFor="name">
									{ translate( 'This will be used for the title of your site.' ) }
								</FormLabel>
							</FormFieldset>

							<FormFieldset>
								<FormTextarea
									id="address"
									name="address"
									placeholder={ translate( 'Address' ) }
									onChange={ this.handleChangeEvent }
								/>
								<FormLabel htmlFor="address">
									{ translate( 'Where can people find your business?' ) }
								</FormLabel>
							</FormFieldset>

							<FormFieldset>
								<FormTextInput
									id="phone"
									name="phone"
									placeholder={ translate( 'Phone Number' ) }
									onChange={ this.handleChangeEvent }
								/>
								<FormLabel htmlFor="phone">
									{ translate( 'How can people contact you?' ) }
								</FormLabel>
							</FormFieldset>

							<div className="business-information__submit-wrapper">
								<Button primary={ true } type="submit">
									{ translate( 'Continue' ) }
								</Button>
							</div>
						</Card>
					</form>
				</div>
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
				headerText={ translate( 'Almost done, just a few more things.' ) }
				subHeaderText={ translate( "We'll add this information to your new website." ) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() }
			/>
		);
	}
}

export default connect(
	state => ( {
		isLoggedIn: isUserLoggedIn( state ),
	} ),
	{}
)( localize( BusinessInformation ) );
