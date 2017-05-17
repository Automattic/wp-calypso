/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormCountrySelect from 'components/forms/form-country-select';
import FormTextInput from 'components/forms/form-text-input';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { forDomainRegistrations as countriesListForDomainRegistrations } from 'lib/countries-list';

const countriesList = countriesListForDomainRegistrations();

class RegistrantExtraInfoForm extends React.PureComponent {
	static propTypes = {
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
		countriesList: PropTypes.object,
	}

	static defaultProps = {
		isVisible: false,
		isProbablyOrganization: false,
		onSubmit: noop,
		countriesList: countriesList,
	}

	constructor( props ) {
		super( props );
		this.handleSubmit = this.handleSubmit.bind( this );
	}

	componentWillMount() {
		this.state = {
			registrantType: this.props.isProbablyOrganization
				? 'organization' : 'individual',
			countryOfBirth: 'AU',
			dateOfBirth: '1978-01-01',
			placeOfBirth: 'dummyCity',
			postalCodeOfBirth: '12345',
			registrantVatId: 'XX123456789',
			sirenSiret: '123456789',
			trademarkNumber: '123456789',
		};
	}

	getRelevantFields( state ) {
		const { countryOfBirth, registrantType } = state;
		const bornInFrance = countryOfBirth === 'FR';
		const birthPlaceFields = [ 'placeOfBirth', 'postalCodeOfBirth' ];
		const individualFields = [
			'countryOfBirth',
			'dateOfBirth',
			...( bornInFrance ? birthPlaceFields : [] ),
		];
		const organizationalFields = [ 'registrantVatId', 'sirenSiret', 'trademarkNumber' ];
		const conditionalFields = registrantType === 'individual'
			? individualFields
			: organizationalFields;
		return [ 'registrantType', ...conditionalFields ];
	}

	handleSubmit() {
		const relevantFields = this.getRelevantFields( this.state );
		// TODO: Validate first
		// TODO: Do we need to strip spaces from VAT or SIRE[NT]?
		const result = pick( this.state, relevantFields );
		this.props.onSubmit( result );
	}

	render() {
		return (
			<div>
				<Card>
					<FormSectionHeading>.FR Registration</FormSectionHeading>
				</Card>
				<Card>
					<FormFieldset>
						<FormLabel>Who's this domain for?</FormLabel>
						<FormRadio value="individual"
							checked={ 'individual' === this.state.registrantType }
							onChange={ this.handleRegistrantTypeChange } />
						<span>An individual</span>
						<FormLabel>
							<FormRadio value="organization"
								checked={ 'organization' === this.state.registrantType }
								onChange={ this.handleRegistrantTypeChange } />
							<span>A company or organization</span>
						</FormLabel>
					</FormFieldset>

					<FormFieldset>
						<FormLabel htmlFor="text_valid">Form Text Input</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							id="text_valid"
							name="text_valid"
							placeholder="Placeholder text..."
						/>
					</FormFieldset>
					<FormFieldset>
						<FormLabel>Country of Birth</FormLabel>
						<FormCountrySelect name="country_code" id="country_code" countriesList={ this.props.countriesList } />
					</FormFieldset>

					<FormFieldset>
						<FormLegend>Date of Birth</FormLegend>
						<div className="registrant-extra-info__dob-inputs">
							<div className="registrant-extra-info__dob-column">
								<FormLabel>Year</FormLabel>
								<FormTextInput type="number" className="registrant-extra-info__dob-year" placeholder="YYYY" />
							</div>
							<div className="registrant-extra-info__dob-column">
								<FormLabel>Month</FormLabel>
								<FormTextInput type="number" className="registrant-extra-info__dob-month" placeholder="MM" />
							</div>
							<div className="registrant-extra-info__dob-column">
								<FormLabel>Day</FormLabel>
								<FormTextInput type="number" className="registrant-extra-info__dob-day" placeholder="DD" />
							</div>
						</div>
						<FormSettingExplanation>e.g. 1970 12 31</FormSettingExplanation>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>Place of Birth</FormLabel>
						<FormTextInput
							id="place_of_birth"
							name="place_of_birth"
							placeholder="Place or city of birth"
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel>Postal Code of Birth</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							id="postal_code_of_birth"
							name="postal_code_of_birth"
							placeholder="ex 75008"
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel className="registrant-extra-info__optional">
							VAT Number
						</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							id="registrant_vat_id"
							name="registrant_vat_id"
							placeholder="ex XX123456789"
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel className="registrant-extra-info__optional">
							SIREN or SIRET Number
						</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							id="registrant_vat_id"
							name="registrant_vat_id"
							placeholder="ex 123 456 789 or 123 456 789 01234"
						/>
					</FormFieldset>

					<FormFieldset>
						<FormLabel className="registrant-extra-info__optional">
							EU Trademark Number
						</FormLabel>
						<FormTextInput
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							id="trademark_number"
							name="trademark_number"
							placeholder="ex 123456789"
						/>
					</FormFieldset>

					<Button className="registrant-extra-info__continue is-primary"
						onClick={ this.handleSubmit }>
						Continue
					</Button>
				</Card>
			</div>
		);
	}
}

RegistrantExtraInfoForm.displayName = 'ExtraInfoFrForm';

export default RegistrantExtraInfoForm;
