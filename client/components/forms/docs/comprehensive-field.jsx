/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { entries } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormCheckbox from 'components/forms/form-checkbox';
import FormCountrySelect from 'components/forms/form-country-select';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormPasswordInput from 'components/forms/form-password-input';
import FormPhoneInput from 'components/forms/form-phone-input';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormSectionHeading from 'components/forms/form-section-heading';

class SyncExample extends React.PureComponent {
	state = {
		fieldValue: '',
		validationMessage: '',
		shouldShowError: false,
	};

	onFieldChange = event => {
		const fieldValue = event.currentTarget.value;
		const shouldShowError = false;
		let validationMessage = '';

		if ( fieldValue < 6 ) {
			validationMessage = 'Your password must be at least six characters long.';
		} else if ( ! /\d/.test( fieldValue ) ) {
			validationMessage = 'Your password must include a number.';
		}

		this.setState( {
			fieldValue,
			shouldShowError,
			validationMessage,
		} );
	}

	checkValidation = () =>
		this.state.validationMessage &&
			this.setState( {
				shouldShowError: true,
			} );

	render() {
		const { fieldValue, shouldShowError, validationMessage } = this.state;

		return (
			<Card>
				<FormSectionHeading>Instant Field Validation</FormSectionHeading>
				<FormFieldset>
					<FormLabel htmlFor="password3">Comprehensive Validation Example</FormLabel>
					<FormPasswordInput
						id="password3"
						name="password3"
						onChange={ this.onFieldChange }
						onBlur={ this.checkValidation }
						value={ fieldValue }
					/>
					{
						shouldShowError
							? <FormInputValidation isError text={ validationMessage } />
							: (
								<FormSettingExplanation>
									This is an explanation of FormTextInput.
								</FormSettingExplanation>
							)
					}
				</FormFieldset>
			</Card>
		);
	}
}

class AsyncExample extends React.PureComponent {
	state = {
		fieldValue: '',
		validationMessage: 'something',
		shouldShowError: false,
		isFetching: false,
	};

	tries = 0;

	onFieldChange = event => {
		const fieldValue = event.currentTarget.value;
		const shouldShowError = false;
		let validationMessage = false;

		if ( fieldValue < 6 ) {
			validationMessage = 'Your password must be at least six characters long.';
		} else if ( ! /\d/.test( fieldValue ) ) {
			validationMessage = 'Your password must include a number.';
		}

		this.setState( {
			fieldValue,
			shouldShowError,
			validationMessage,
		} );
	}

	fakeAsyncCall = () => new Promise(
		( resolve, reject ) => {
			setTimeout(
				() => {
					this.tries++;

					console.log( this.tries );

					return ( this.tries >= 2 )
						? reject()
						: resolve();

				},
				1000
			)
		}
	);

	checkValidation = () => {
		const { validationMessage } = this.state;

		if ( validationMessage ) {
			return this.setState( {
				shouldShowError: true,
			} );
		}

		this.setState( {
			isFetching: true,
		}, () => {
			this.fakeAsyncCall()
				.then( () => {
					this.setState( {
						hasServerValidated: true,
						serverValidationError: false,
						isFetching: false,
					} );
				} )
				.catch( () => {
					this.setState( {
						hasServerValidated: false,
						serverValidationError: 'This is an error from the server',
						isFetching: false,
					} );
				} )
		} );
	}

	render() {
		const {
			fieldValue,
			shouldShowError,
			validationMessage,
			hasServerValidated,
			serverValidationError,
			isFetching,
		} = this.state;

		// const showError =

		return (
			<Card>
				<FormSectionHeading>Instant Field Validation</FormSectionHeading>
				<FormFieldset>
					<FormLabel htmlFor="username2">Async Field Example</FormLabel>
					<FormTextInput
						id="username2"
						name="username2"
						disabled={ isFetching }
						onChange={ this.onFieldChange }
						onBlur={ this.checkValidation }
					/>
					{
						hasServerValidated
							? (
								<FormInputValidation text="This username is free to use!" />
							)
							: ( shouldShowError || serverValidationError )
								? (
									<FormInputValidation isError text={ validationMessage || serverValidationError } />
								)
								: (
									<FormSettingExplanation>
										This is an explanation of FormTextInput.
									</FormSettingExplanation>
								)
					}
				</FormFieldset>
			</Card>
		);
	}
}

const ComprehensiveFieldExamples = () => (
	<div>
		<p>
			The form fields components act as wrapper components to aid in componentizing CSS. Here is
			an example of all of the form fields components and their expected markup.
		</p>

		<SyncExample />

		<p>
			The form fields components act as wrapper components to aid in componentizing CSS. Here is
			an example of all of the form fields components and their expected markup.
		</p>

		<AsyncExample />

		<br/>
	</div>
);

export default ComprehensiveFieldExamples;
