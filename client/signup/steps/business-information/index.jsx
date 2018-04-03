/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import formState from 'lib/form-state';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';

import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormInputCheckbox from 'components/forms/form-checkbox';

class BusinessInformationStep extends React.Component {
	static propTypes = {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setSiteTitle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	};

	componentDidMount() {
		this.formStateController = new formState.Controller( {
			fieldNames: [
				'phoneNumber',
				'emailAddress',
				'mailingAddress',
				'businessHours',
				'contactMap',
			],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				phoneNumber: { value: '' },
				emailAddress: { value: '' },
				mailingAddress: { value: '' },
				contactMap: { value: true },
				businessHours: { value: '' },
			},
		} );

		this.setFormState( this.formStateController.getInitialState() );
	}

	setFormState = state => {
		this.setState( { form: state } );
	};

	handleChangeEvent = event => {
		this.formStateController.handleFieldChange( {
			name: event.target.name,
			value: event.target.value,
		} );
	};

	handleSubmit = event => {
		event.preventDefault();
		const { goToNextStep, stepName, translate } = this.props;

		//Submit Step
		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Populating your business contact information.' ),
				stepName: stepName,
			},
			[],
			{
				businessInformation: {
					phoneNumber: formState.getFieldValue( this.state.form, 'phoneNumber' ),
					emailAddress: formState.getFieldValue( this.state.form, 'emailAddress' ),
					mailingAddress: formState.getFieldValue( this.state.form, 'mailingAddress' ),
					contactMap: formState.getFieldValue( this.state.form, 'contactMap' ),
					businessHours: formState.getFieldValue( this.state.form, 'businessHours' ),
				},
			}
		);

		goToNextStep();
	};

	skipStep = () => {
		this.submitSiteTitleStep( '' );
	};

	renderBusinessInformationStep() {
		const { translate } = this.props;

		return (
			<form onSubmit={ this.handleSubmit }>
				<Card className="business-information__wrapper">
					<FormFieldset>
						<FormLabel htmlFor="phoneNumber">
							{ translate( 'What’s the phone number that customers will use to contact you?' ) }
						</FormLabel>
						<FormTextInput
							id="phoneNumber"
							name="phoneNumber"
							placeholder={ translate( 'e.g. (555) 555-5555' ) }
							onChange={ this.handleChangeEvent }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="emailAddress">
							{ translate( 'What’s the email address that customers will use to contact you?' ) }
						</FormLabel>
						<FormTextInput
							id="emailAddress"
							name="emailAddress"
							placeholder={ translate( 'e.g. contact@mybusinesswebsite.com' ) }
							onChange={ this.handleChangeEvent }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="mailingAddress">
							{ translate( 'What’s your business’s address?' ) }
						</FormLabel>
						<FormTextarea
							id="mailingAddress"
							name="mailingAddress"
							placeholder={ translate( '123 Main Street, Somewhere XY, 54321' ) }
							onChange={ this.handleChangeEvent }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="contactMap">
							<FormInputCheckbox
								name="contactMap"
								id="contactMap"
								onChange={ this.handleChangeEvent }
								value={ true }
							/>
							{ translate( 'Would you like us to include a map?' ) }
						</FormLabel>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="businessHours">
							{ translate( 'What are you business hours?' ) }
						</FormLabel>
						<FormTextarea
							id="businessHours"
							name="businessHours"
							placeholder={ translate( 'Mon-Fri: 9am-5pm, Weekends: 10am-4pm' ) }
							onChange={ this.handleChangeEvent }
						/>
					</FormFieldset>

					<Button primary={ true } type="submit">
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</form>
		);
	}

	render() {
		const { translate } = this.props;

		const headerText = translate( 'We can help set up your site.' );
		const subHeaderText = translate(
			'We will use this information to help pre-populate your site for you. You can easily make changes later.'
		);

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackSubHeaderText={ subHeaderText }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderBusinessInformationStep() }
				goToNextStep={ this.skipStep }
			/>
		);
	}
}

export default connect( null, { setSiteTitle } )( localize( BusinessInformationStep ) );
