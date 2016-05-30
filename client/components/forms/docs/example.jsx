/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import { forSms } from 'lib/countries-list';
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormCheckbox from 'components/forms/form-checkbox';
import FormCountrySelect from 'components/forms/form-country-select';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormPasswordInput from 'components/forms/form-password-input';
import FormPhoneInput from 'components/forms/form-phone-input';
import FormRadio from 'components/forms/form-radio';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormStateSelector from 'components/forms/us-state-selector';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormToggle from 'components/forms/form-toggle';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import DocsExample, { DocsExampleStats } from 'components/docs-example';

const countriesList = forSms();

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

	getUsageStats: function ( Component, isCompact = false ) {
		const options = { folder: 'forms', compact: isCompact };
		return this.props.getUsageStats( Component, options ).count || 0;
	},

	render: function() {
		return (
			<DocsExample
				title="Form Fields"
				url="/devdocs/design/form-fields"
			>
				<p>
					The form fields components act as wrapper components to aid in componentizing CSS.
					Here is an example of all of the form fields components and their expected markup.
				</p>

				<p>
					The following form fields components are wrapped in Card components to demonstrate the FormSectionHeading component.
				</p>

				<Card>
					<FormSectionHeading>Form Section Heading</FormSectionHeading>
					<DocsExampleStats count={ this.getUsageStats( FormSectionHeading ) } />

					<FormFieldset>
						<FormLegend>Form Checkbox</FormLegend>
						<FormLabel>
							<FormCheckbox id="comment_like_notification" name="comment_like_notification" />
							<span>Email me when someone Likes one of my comments.</span>
						</FormLabel>
						<DocsExampleStats count={ this.getUsageStats( FormCheckbox ) } />
					</FormFieldset>

					<FormFieldset>
						<div className="form-fieldset">
							<FormLabel htmlFor="username">Disabled Form Text Input</FormLabel>
							<FormTextInput
								id="username"
								name="username"
								disabled
								placeholder="Placeholder text..."
							/>
						</div>

						<div className="form-fieldset">
							<FormLabel htmlFor="username">Form Text Input</FormLabel>
							<FormTextInput id="username" name="username" placeholder="Placeholder text..." />
							<FormSettingExplanation>This is an explanation of FormTextInput.</FormSettingExplanation>
						</div>

						<div className="form-fieldset">
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
						</div>

						<div className="form-fieldset">
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
						</div>

						<DocsExampleStats count={ this.getUsageStats( FormTextInput ) } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="text_with_affixes">Form Text Input With Affixes</FormLabel>
						<FormTextInputWithAffixes
							id="text_with_affixes"
							placeholder="Placeholder text..."
							prefix="Prefix"
							suffix="Suffix"
							/>
						<DocsExampleStats count={ this.getUsageStats( FormTextInputWithAffixes ) } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="select">Form Select</FormLabel>
						<DocsExampleStats count={ this.getUsageStats( FormSelect ) } />
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
						<DocsExampleStats count={ this.getUsageStats( FormPasswordInput ) } />
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
					<DocsExampleStats count={ this.getUsageStats( FormToggle ) } />
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
					<DocsExampleStats count={ this.getUsageStats( CompactFormToggle, true ) } />

					<FormButtonsBar>
						<FormButton>Form Button</FormButton>
					</FormButtonsBar>
					<DocsExampleStats count={ this.getUsageStats( FormButtonsBar ) } />
				</Card>

				<Card>
					<FormSectionHeading>Form Section Heading</FormSectionHeading>

					<FormFieldset>
						<FormLabel htmlFor="country_code">Form Country Select</FormLabel>
						<FormCountrySelect name="country_code" id="country_code" countriesList={ countriesList } />
						<DocsExampleStats count={ this.getUsageStats( FormCountrySelect ) } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="us_state">Form US State Select</FormLabel>
						<FormStateSelector name="us_state" id="us_state" />
						<DocsExampleStats count={ this.getUsageStats( FormStateSelector ) } />
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
						<DocsExampleStats count={ this.getUsageStats( FormRadio ) } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="telInput">Form Tel Input</FormLabel>
						<FormTelInput name="telInput" id="telInput" placeholder="Placeholder text..." />
						<DocsExampleStats count={ this.getUsageStats( FormTelInput ) } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel>Form Phone Input</FormLabel>
						<FormPhoneInput
							initialCountryCode="US"
							initialPhoneNumber="8772733049"
							countriesList={ countriesList }
							/>
						<DocsExampleStats count={ this.getUsageStats( FormPhoneInput ) } />
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="textarea">Form Textarea</FormLabel>
						<FormTextarea name="textarea" id="textarea" placeholder="Placeholder text..."></FormTextarea>
						<DocsExampleStats count={ this.getUsageStats( FormTextarea ) } />
					</FormFieldset>

					<FormButtonsBar>
						<FormButton>Form Button</FormButton>
						<FormButton type="button" isPrimary={ false }>Secondary Form Button</FormButton>
					</FormButtonsBar>
					<DocsExampleStats count={ this.getUsageStats( FormButtonsBar ) } />
				</Card>
			</DocsExample>
		);
	}
} );

module.exports = FormFields;
