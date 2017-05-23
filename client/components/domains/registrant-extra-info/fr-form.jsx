/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { noop } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import debugFactory from 'debug';

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

const debug = debugFactory( 'calypso:domains:registrant-extra-info' );

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

	handleDobChangeEvent = ( event ) => {
		this.handleChangeEvent( event );
		// setState() is not syncronous :(
		const updatedState = {
			...this.state,
			[ event.target.name ]: event.target.value,
		};
		const { dob_years: years, dob_months: months, dob_days: days } = updatedState;

		if ( years && months && days ) {
			const value = [ years, months, days ].join( '-' );
			const pseudoEvent = {
				target: {
					name: 'dateOfBirth',
					value
				}
			};
			debug( 'Setting dateOfBirth to ' + value +
				( moment( value, 'YYYY-MM-DD' ).isValid() ? '' : ' (invalid)' ) );
			this.handleChangeEvent( pseudoEvent );
		}
	}

	handleChangeEvent = ( event ) => {
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
					<FormLegend>
						{ this.props.translate( "Who's this domain for?" ) }
					</FormLegend>
					<FormLabel>
						<FormRadio value="individual"
							name="registrantType"
							checked={ 'individual' === this.state.registrantType }
							onChange={ this.handleChangeEvent } />
						<span>{ this.props.translate( 'An individual' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio value="organization"
							name="registrantType"
							checked={ 'organization' === this.state.registrantType }
							onChange={ this.handleChangeEvent } />
						<span>{ this.props.translate( 'A company or organization' ) }</span>
					</FormLabel>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						{ this.props.translate( 'Country of Birth' ) }
					</FormLabel>
					<FormCountrySelect
						name="countryOfBirth"
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
							<FormTextInput className="registrant-extra-info__dob-year"
								name="dob_years"
								type="number"
								placeholder="YYYY"
								onChange={ this.handleDobChangeEvent } />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel>
								{ this.props.translate( 'Month' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-month"
								name="dob_months"
								type="number"
								placeholder="MM"
								onChange={ this.handleDobChangeEvent } />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel>
								{ this.props.translate( 'Day' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-day"
								name="dob_days"
								type="number"
								placeholder="DD"
								onChange={ this.handleDobChangeEvent } />
						</div>
					</div>
					<FormSettingExplanation>{
						this.props.translate( 'e.g. 1970 12 31', {
							comment: 'This is describing a date format with fixed fields, so please do not ' +
								'alter the numbers (Year, Month, Day). Please translate e.g("For example") if appropriate.'
						} )
					}</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						{ this.props.translate( 'Place of Birth' ) }
					</FormLabel>
					<FormTextInput
						name="placeOfBirth"
						placeholder={ this.props.translate( 'Place or city of birth' ) }
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel>
						{ this.props.translate( 'Postal Code of Birth' ) }
					</FormLabel>
					<FormTextInput
						name="postalCodeOfBirth"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ this.props.translate( 'ex 75008' ) }
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional">
						{ this.props.translate( 'VAT Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						name="registrantVatId"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ this.props.translate( 'ex XX123456789' ) }
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional">
						{ this.props.translate( 'SIREN or SIRET Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						name="sirenSiret"
						placeholder={
							this.props.translate( 'ex 123 456 789 or 123 456 789 01234',
								{ comment: 'ex is short for "example". The numbers are examples of the EU VAT format' }
							)
						}
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional">
						{ this.props.translate( 'EU Trademark Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						name="trademarkNumber"
						type="number"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={
							this.props.translate( 'ex 123456789',
								{ comment: 'ex is short for example. The number is the EU trademark number format.' }
							)
						}
						onChange={ this.handleChangeEvent } />
				</FormFieldset>
				{ this.props.children }
			</form>
		);
	}

	renderOptional = () => {
		return (
			<div>{ this.props.translate( 'Optional' ) }</div>
		);
	}
}

RegistrantExtraInfoForm.displayName = 'ExtraInfoFrForm';

export default localize( RegistrantExtraInfoForm );
