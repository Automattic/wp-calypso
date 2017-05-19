/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
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
		onStateChanged: PropTypes.func, // Just until we can reduxify the contact details
	}

	static defaultProps = {
		isVisible: true,
		isProbablyOrganization: false,
		onSubmit: noop,
		countriesList: countriesList,
	}

	constructor( props ) {
		super( props );
	}

	componentWillMount() {
		this.setState( {
			registrantType: this.props.isProbablyOrganization
				? 'organization' : 'individual',
			countryOfBirth: 'AU',
			dateOfBirth: '1978-01-01',
			placeOfBirth: 'dummyCity',
			postalCodeOfBirth: '12345',
			registrantVatId: 'XX123456789',
			sirenSiret: '123456789',
			trademarkNumber: '123456789',
		} );
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

	handleChangeEvent = ( event ) => {
		console.log( 'handleChangeEvent… event.target.name:', event.target.name, 'event.target.value:', event.target.value );
		this.setState( { [ event.target.name ]: event.target.value } );
	}

	componentWillUpdate( _ /* nextProps */, nextState ) {
		// This is pretty dirty :(
		// The sooner we can get the contact details into the state, the better
		this.props.onStateChanged && this.props.onStateChanged( nextState );
	}

	render = () => {
		return (
			<form>
				<FormFieldset>
					<FormLabel>
						{ this.props.translate( "Who's this domain for?" ) }
					</FormLabel>
					<FormRadio value="individual"
						checked={ 'individual' === this.state.registrantType }
						name="registrantType"
						onChange={ this.handleChangeEvent } />
					<span>An individual</span>

					<FormLabel>
						<FormRadio value="organization"
							checked={ 'organization' === this.state.registrantType }
							name="registrantType"
							onChange={ this.handleChangeEvent } />
						<span>A company or organization</span>
					</FormLabel>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						{ this.props.translate( 'Country of Birth' ) }
					</FormLabel>
					<FormCountrySelect
						name="country_code"
						id="country_code"
						countriesList={ this.props.countriesList }
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLegend>
						{ this.props.translate( 'Date of Birth' ) }
					</FormLegend>
					<div className="registrant-extra-info__dob-inputs">
						<div className="registrant-extra-info__dob-column">
							<FormLabel>
								{ this.props.translate( 'Year' ) }
							</FormLabel>
							<FormTextInput type="number" className="registrant-extra-info__dob-year" placeholder="YYYY" />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel>
								{ this.props.translate( 'Month' ) }
							</FormLabel>
							<FormTextInput type="number" className="registrant-extra-info__dob-month" placeholder="MM" />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel>
								{ this.props.translate( 'Day' ) }
							</FormLabel>
							<FormTextInput type="number" className="registrant-extra-info__dob-day" placeholder="DD" />
						</div>
					</div>
					<FormSettingExplanation>e.g. 1970 12 31</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						{ this.props.translate( 'Place of Birth' ) }
					</FormLabel>
					<FormTextInput
						id="place_of_birth"
						name="place_of_birth"
						placeholder="Place or city of birth"
					/>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						{ this.props.translate( 'Postal Code of Birth' ) }
					</FormLabel>
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
						{ this.props.translate( 'VAT Number' ) }
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
						{ this.props.translate( 'SIREN or SIRET Number' ) }
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
						{ this.props.translate( 'EU Trademark Number' ) }
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
				{ this.props.children }
			</form>
		);
	}
}

RegistrantExtraInfoForm.displayName = 'ExtraInfoFrForm';

export default localize( RegistrantExtraInfoForm );
