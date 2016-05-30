/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var countriesList = require( 'lib/countries-list' ).forSms(),
	Card = require( 'components/card' ),
	FormButton = require( 'components/forms/form-button' ),
	FormButtonsBar = require( 'components/forms/form-buttons-bar' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	FormCountrySelect = require( 'components/forms/form-country-select' ),
	FormFieldset = require( 'components/forms/form-fieldset' ),
	FormInputValidation = require( 'components/forms/form-input-validation' ),
	FormLabel = require( 'components/forms/form-label' ),
	FormLegend = require( 'components/forms/form-legend' ),
	FormPasswordInput = require( 'components/forms/form-password-input' ),
	FormPhoneInput = require( 'components/forms/form-phone-input' ),
	FormRadio = require( 'components/forms/form-radio' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	FormSelect = require( 'components/forms/form-select' ),
	FormSettingExplanation = require( 'components/forms/form-setting-explanation' ),
	FormStateSelector = require( 'components/forms/us-state-selector' ),
	FormTelInput = require( 'components/forms/form-tel-input' ),
	FormTextarea = require( 'components/forms/form-textarea' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	FormTextInputWithAffixes = require( 'components/forms/form-text-input-with-affixes' ),
	FormToggle = require( 'components/forms/form-toggle' ),
	CompactFormToggle = require( 'components/forms/form-toggle/compact' );

var FormFields = React.createClass( {
	displayName: 'FormFields',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			checkedRadio: 'first',
			toggled: false,
			compactToggled: false
		};
	},

	handleRadioChange: function( event ) {
		this.setState( { checkedRadio: event.currentTarget.value } );
	},

	handleToggle: function() {
		this.setState( { toggled: ! this.state.toggled } );
	},

	handleCompactToggle: function() {
		this.setState( { compactToggled: ! this.state.compactToggled } );
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/form-fields">Form Fields</a>
				</h2>

				<p>
					The form fields components act as wrapper components to aid in componentizing CSS.
					Here is an example of all of the form fields components and their expected markup.
				</p>

				<p>
					The following form fields components are wrapped in Card components to demonstrate the FormSectionHeading component.
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
						<FormSettingExplanation>This is an explanation of FormTextInput.</FormSettingExplanation>
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
						<FormLabel htmlFor="password">{ this.translate( 'Form Password Input' ) }</FormLabel>
						<FormPasswordInput
							id="password"
							name="password" />
					</FormFieldset>

					<FormLegend>Form Toggle</FormLegend>
					<FormToggle
						checked={ this.state.toggled }
						onChange={ this.handleToggle }
					/>
					<br />
					<FormToggle
						checked={ false }
						disabled={ true }
					/>
					<br />
					<FormToggle
						checked={ true }
						disabled={ true }
					/>
					<br />
					<CompactFormToggle
						checked={ this.state.compactToggled }
						onChange={ this.handleCompactToggle }
					/>
					<br />
					<CompactFormToggle
						checked={ false }
						disabled={ true }
					/>

					<FormButtonsBar>
						<FormButton>Form Button</FormButton>
					</FormButtonsBar>
				</Card>

				<Card>
					<FormSectionHeading>Form Section Heading</FormSectionHeading>

					<FormFieldset>
						<FormLabel htmlFor="country_code">Form Country Select</FormLabel>
						<FormCountrySelect name="country_code" id="country_code" countriesList={ countriesList } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="us_state">Form US State Select</FormLabel>
						<FormStateSelector name="us_state" id="us_state" />
					</FormFieldset>

					<FormFieldset>
						<FormLegend>Form Radios</FormLegend>
						<FormLabel>
							<FormRadio value="first" checked={ 'first' === this.state.checkedRadio } onChange={ this.handleRadioChange } />
							<span>First radio</span>
						</FormLabel>

						<FormLabel>
							<FormRadio value="second" checked={ 'second' === this.state.checkedRadio } onChange={ this.handleRadioChange } />
							<span>Second radio</span>
						</FormLabel>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="telInput">Form Tel Input</FormLabel>
						<FormTelInput name="telInput" id="telInput" placeholder="Placeholder text..." />
					</FormFieldset>

					<FormFieldset>
						<FormLabel>Form Phone Input</FormLabel>
						<FormPhoneInput
							initialCountryCode="US"
							initialPhoneNumber="8772733049"
							countriesList={ countriesList }
							/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="textarea">Form Textarea</FormLabel>
						<FormTextarea name="textarea" id="textarea" placeholder="Placeholder text..."></FormTextarea>
					</FormFieldset>

					<FormButtonsBar>
						<FormButton>Form Button</FormButton>
						<FormButton type="button" isPrimary={ false }>Secondary Form Button</FormButton>
					</FormButtonsBar>
				</Card>
			</div>
		);
	}
} );

module.exports = FormFields;
