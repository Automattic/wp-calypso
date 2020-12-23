/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CURRENCIES } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormButton from 'calypso/components/forms/form-button';
import FormButtonsBar from 'calypso/components/forms/form-buttons-bar';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormCountrySelect from 'calypso/components/forms/form-country-select';
import FormCurrencyInput from 'calypso/components/forms/form-currency-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormLegend from 'calypso/components/forms/form-legend';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormRadio from 'calypso/components/forms/form-radio';
import FormRadiosBarExample from 'calypso/components/forms/form-radios-bar/docs/example';
import FormRadioWithThumbnail from 'calypso/components/forms/form-radio-with-thumbnail';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormStateSelector from 'calypso/components/forms/us-state-selector';
import FormTelInput from 'calypso/components/forms/form-tel-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAction from 'calypso/components/forms/form-text-input-with-action';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import FormToggle from 'calypso/components/forms/form-toggle';
import getCountries from 'calypso/state/selectors/get-countries';
import PhoneInput from 'calypso/components/phone-input';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';

const currencyList = Object.entries( CURRENCIES ).map( ( [ code ] ) => ( { code } ) );
const visualCurrencyList = Object.entries( CURRENCIES ).map( ( [ code, { symbol } ] ) => ( {
	code,
	label: `${ code } ${ symbol }`,
} ) );

class FormFields extends React.PureComponent {
	static propTypes = {
		countriesList: PropTypes.array.isRequired,
	};

	state = {
		checkedRadio: 'first',
		toggled: false,
		phoneInput: { countryCode: 'US', value: '' },
		currencyInput: { currency: 'USD', value: '' },
	};

	handleRadioChange = ( event ) => {
		this.setState( { checkedRadio: event.currentTarget.value } );
	};

	handleToggle = () => {
		this.setState( { toggled: ! this.state.toggled } );
	};

	handleAction = () => {
		window.alert( 'Thank you.' );
	};

	handlePhoneInputChange = ( data ) => {
		this.setState( { phoneInput: data } );
	};

	handleCurrencyChange = ( event ) => {
		const { value: currency } = event.currentTarget;

		this.setState( ( state ) => ( {
			currencyInput: { ...state.currencyInput, currency },
		} ) );
	};

	handlePriceChange = ( event ) => {
		const { value } = event.currentTarget;

		this.setState( ( state ) => ( {
			currencyInput: { ...state.currencyInput, value },
		} ) );
	};

	render() {
		return (
			<div>
				<p>
					The form fields components act as wrapper components to aid in componentizing CSS. Here is
					an example of all of the form fields components and their expected markup.
				</p>

				<p>
					The following form fields components are wrapped in Card components to demonstrate the
					FormSectionHeading component.
				</p>

				<Card>
					<FormSectionHeading>Form Section Heading</FormSectionHeading>

					<FormFieldset>
						<FormLegend>Form Checkbox</FormLegend>
						<FormLabel>
							<FormCheckbox id="comment_like_notification" name="comment_like_notification" />
							<span>Email me when someone Likes one of my comments.</span>
						</FormLabel>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="username">Disabled Form Text Input</FormLabel>
						<FormTextInput
							id="username"
							name="username"
							disabled
							placeholder="Placeholder text..."
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="username">Form Text Input</FormLabel>
						<FormTextInput id="username" name="username" placeholder="Placeholder text..." />
						<FormSettingExplanation>
							This is an explanation of FormTextInput.
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="text_valid">Form Text Input</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							id="text_valid"
							name="text_valid"
							className="is-valid"
							placeholder="Placeholder text..."
						/>
						<FormInputValidation text="Your text can be saved." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="text_invalid">Form Text Input</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							id="text_invalid"
							name="text_invalid"
							className="is-error"
							placeholder="Placeholder text..."
						/>
						<FormInputValidation isError text="Your text is too short." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="text_with_affixes">Form Text Input With Action</FormLabel>
						<FormTextInputWithAction
							placeholder="Enter a name for your site"
							action="Continue"
							onAction={ this.handleAction }
						/>
						<FormSettingExplanation>
							Action becomes avaliable when filled. Can be triggered by clicking button or pressing
							enter.
						</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="text_with_affixes">Form Text Input With Affixes</FormLabel>
						<FormTextInputWithAffixes
							id="text_with_affixes"
							placeholder="Placeholder text..."
							prefix="Prefix"
							suffix="Suffix"
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="select">Form Select</FormLabel>
						<FormSelect id="select">
							<option>1</option>
							<option>2</option>
							<option>3</option>
							<option>4</option>
						</FormSelect>
						<FormSelect id="select-disabled" disabled>
							<option>Disabled</option>
						</FormSelect>
						<br />
						<FormSelect id="select-error" className="is-error">
							<option>Error</option>
						</FormSelect>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="password">Form Password Input</FormLabel>
						<FormPasswordInput id="password" name="password" />
					</FormFieldset>

					<FormLegend>Form Toggle</FormLegend>
					<FormToggle checked={ this.state.toggled } onChange={ this.handleToggle } />
					<br />
					<FormToggle checked={ false } disabled />
					<br />
					<FormToggle checked disabled />
					<br />

					<FormButtonsBar>
						<FormButton>Form Button</FormButton>
					</FormButtonsBar>
				</Card>

				<Card>
					<FormSectionHeading>Form Section Heading</FormSectionHeading>

					<FormFieldset>
						<FormLabel htmlFor="country_code">Form Country Select</FormLabel>
						<QuerySmsCountries />
						<FormCountrySelect
							name="country_code"
							id="country_code"
							countriesList={ this.props.countriesList }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="us_state">Form US State Select</FormLabel>
						<FormStateSelector name="us_state" id="us_state" />
					</FormFieldset>

					<FormFieldset>
						<FormLegend>Form Radios</FormLegend>
						<FormLabel>
							<FormRadio
								value="first"
								checked={ 'first' === this.state.checkedRadio }
								onChange={ this.handleRadioChange }
								label="First radio"
							/>
						</FormLabel>

						<FormLabel>
							<FormRadio
								value="second"
								checked={ 'second' === this.state.checkedRadio }
								onChange={ this.handleRadioChange }
								label="Second radio"
							/>
						</FormLabel>
					</FormFieldset>

					<FormFieldset>
						<FormLegend>Form Radio With Thumbnail</FormLegend>
						<div>
							<FormRadioWithThumbnail
								label="First radio"
								thumbnail={ { cssClass: 'some-class' } }
								value="first"
								checked={ 'first' === this.state.checkedRadio }
								onChange={ this.handleRadioChange }
							/>
						</div>
					</FormFieldset>

					<FormFieldset>
						<FormLegend>Form Radios Bar</FormLegend>
						<FormRadiosBarExample
							isThumbnail={ false }
							checked={ this.state.checkedRadio }
							onChange={ this.handleRadioChange }
						/>
						<br />
						<FormRadiosBarExample
							isThumbnail
							checked={ this.state.checkedRadio }
							onChange={ this.handleRadioChange }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="telInput">Form Tel Input</FormLabel>
						<FormTelInput name="telInput" id="telInput" placeholder="Placeholder text..." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="telInput_valid">Form Tel Input</FormLabel>
						<FormTelInput
							name="telInput"
							id="telInput_valid"
							placeholder="Placeholder text..."
							isValid
						/>
						<FormInputValidation text="The phone number can be saved." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="telInput_error">Form Tel Input</FormLabel>
						<FormTelInput
							name="telInput"
							id="telInput_error"
							placeholder="Placeholder text..."
							isError
						/>
						<FormInputValidation isError text="The phone number is invalid." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel>Form Phone Input</FormLabel>
						<FormPhoneInput
							initialCountryCode="US"
							initialPhoneNumber="8772733049"
							countriesList={ this.props.countriesList }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>Form Media Phone Input</FormLabel>
						<PhoneInput
							countryCode={ this.state.phoneInput.countryCode }
							value={ this.state.phoneInput.value }
							countriesList={ this.props.countriesList }
							onChange={ this.handlePhoneInputChange }
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="currency_input">Form Currency Input</FormLabel>
						<FormCurrencyInput
							name="currency_input"
							id="currency_input"
							currencySymbolPrefix="$"
							placeholder="Placeholder text..."
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="currency_input_valid">Form Currency Input</FormLabel>
						<FormCurrencyInput
							name="currency_input"
							id="currency_input_valid"
							currencySymbolPrefix="$"
							placeholder="Placeholder text..."
							isValid
						/>
						<FormInputValidation text="The price is very good." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="currency_input_error">Form Currency Input</FormLabel>
						<FormCurrencyInput
							name="currency_input"
							id="currency_input_error"
							currencySymbolPrefix="$"
							placeholder="Placeholder text..."
							isError
						/>
						<FormInputValidation isError text="The price is invalid." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="currency_input_editable">Editable Form Currency Input</FormLabel>
						<FormCurrencyInput
							name="currency_input_editable"
							id="currency_input_editable"
							value={ this.state.currencyInput.value }
							onChange={ this.handlePriceChange }
							currencySymbolPrefix={ this.state.currencyInput.currency }
							onCurrencyChange={ this.handleCurrencyChange }
							currencyList={ currencyList }
							placeholder="Placeholder text..."
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="currency_input_editable">
							Editable Form Currency Input (customized list)
						</FormLabel>
						<FormCurrencyInput
							name="currency_input_editable"
							id="currency_input_editable"
							value={ this.state.currencyInput.value }
							onChange={ this.handlePriceChange }
							currencySymbolPrefix={ this.state.currencyInput.currency }
							onCurrencyChange={ this.handleCurrencyChange }
							currencyList={ visualCurrencyList }
							placeholder="Placeholder text..."
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="textarea">Form Textarea</FormLabel>
						<FormTextarea name="textarea" id="textarea" placeholder="Placeholder text..." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="textarea_valid">Form Textarea</FormLabel>
						<FormTextarea
							name="textarea"
							id="textarea_valid"
							placeholder="Placeholder text..."
							isValid
						/>
						<FormInputValidation text="Your text can be saved." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="textarea_error">Form Textarea</FormLabel>
						<FormTextarea
							name="textarea"
							id="textarea_error"
							placeholder="Placeholder text..."
							isError
						/>
						<FormInputValidation isError text="Your text is invalid." />
					</FormFieldset>

					<FormButtonsBar>
						<FormButton>Form Button</FormButton>
						<FormButton type="button" isPrimary={ false }>
							Secondary Form Button
						</FormButton>
					</FormButtonsBar>
				</Card>
			</div>
		);
	}
}

const ConnectedFormFields = connect( ( state ) => ( {
	countriesList: getCountries( state, 'sms' ),
} ) )( FormFields );

ConnectedFormFields.displayName = 'FormFields';

export default ConnectedFormFields;
