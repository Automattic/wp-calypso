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
import FormInputCheckbox from 'components/forms/form-checkbox';

class BusinessAddOnsStep extends React.Component {
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
			fieldNames: [ 'blogEnabled', 'contactForm', 'leadGeneration', 'simplePayments' ],
			validatorFunction: noop,
			onNewState: this.setFormState,
			hideFieldErrorsOnChange: true,
			initialState: {
				blogEnabled: { value: false },
				contactForm: { value: false },
				leadGeneration: { value: false },
				simplePayments: { value: false },
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
		const { goToNextStep, stepName, translate, signupDependencies } = this.props;

		const stepOptionInformation = {
			blogEnabled: formState.getFieldValue( this.state.form, 'blogEnabled' ),
		};

		const stepHeadstartInformation = {
			contactForm: formState.getFieldValue( this.state.form, 'contactForm' ),
			leadGeneration: formState.getFieldValue( this.state.form, 'leadGeneration' ),
			simplePayments: formState.getFieldValue( this.state.form, 'simplePayments' ),
		};

		const stepSiteInformation = Object.assign( {}, signupDependencies.siteInformation, {
			options: Object.assign(
				{},
				signupDependencies.siteInformation.options,
				stepOptionInformation
			),
			headstart: Object.assign(
				{},
				signupDependencies.siteInformation.headstart,
				stepHeadstartInformation
			),
		} );

		//Submit Step
		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Populating your business contact information.' ),
				stepName: stepName,
			},
			[],
			{
				siteInformation: Object.assign(
					{},
					signupDependencies.siteInformation,
					stepSiteInformation
				),
			}
		);

		goToNextStep();
	};

	skipStep = () => this.props.goToNextStep();

	renderBusinessAddOnsStep() {
		const { translate } = this.props;

		return (
			<form onSubmit={ this.handleSubmit }>
				<Card className="business-add-ons__wrapper">
					<FormFieldset className="business-add-ons__checkboxes">
						<FormLabel htmlFor="blogEnabled" className="business-add-ons__checkbox-label">
							<FormInputCheckbox
								name="blogEnabled"
								id="blogEnabled"
								className="business-add-ons__checkbox"
								onChange={ this.handleChangeEvent }
								value={ true }
							/>
							{ translate( 'A blog' ) }
						</FormLabel>

						<FormLabel htmlFor="contactForm" className="business-add-ons__checkbox-label">
							<FormInputCheckbox
								name="contactForm"
								id="contactForm"
								className="business-add-ons__checkbox"
								onChange={ this.handleChangeEvent }
								value={ true }
							/>
							{ translate( 'A contact form' ) }
						</FormLabel>

						<FormLabel htmlFor="leadGeneration" className="business-add-ons__checkbox-label">
							<FormInputCheckbox
								name="leadGeneration"
								id="leadGeneration"
								className="business-add-ons__checkbox"
								onChange={ this.handleChangeEvent }
								value={ true }
							/>
							{ translate( 'An email subscription pop-up' ) }
						</FormLabel>

						<FormLabel htmlFor="simplePayments" className="business-add-ons__checkbox-label">
							<FormInputCheckbox
								name="simplePayments"
								id="simplePayments"
								className="business-add-ons__checkbox"
								onChange={ this.handleChangeEvent }
								value={ true }
							/>
							{ translate( 'Simple payment buttons' ) }
						</FormLabel>
					</FormFieldset>

					<Button primary={ true } type="submit" className="business-add-ons__submit">
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</form>
		);
	}

	render() {
		const { translate } = this.props;

		const headerText = translate( 'Website Add-Ons:' );
		const subHeaderText = translate(
			'Would you like us to set up any of the following for your wesbite?'
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
				stepContent={ this.renderBusinessAddOnsStep() }
				goToNextStep={ this.skipStep }
			/>
		);
	}
}

export default connect( null, { setSiteTitle } )( localize( BusinessAddOnsStep ) );
