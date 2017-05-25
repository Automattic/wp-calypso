/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { isEqual, noop } from 'lodash';
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

const debug = debugFactory( 'calypso:domains:registrant-extra-info' );

export function getRelevantFields( state ) {
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

class RegistrantExtraInfoForm extends React.PureComponent {
	static propTypes = {
		countriesList: PropTypes.object.isRequired,
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
		onStateChanged: PropTypes.func, // Just until we can reduxify the contact details
	}

	static defaultProps = {
		countriesList: { data: [] },
		isVisible: true,
		isProbablyOrganization: false,
		values: {},
		onSubmit: noop,
		onStateChanged: noop,
	}

	constructor( props ) {
		super( props );
	}

	componentWillMount() {
		const defaults = {
			registrantType: this.props.isProbablyOrganization
				? 'organization' : 'individual',
			countryOfBirth: 'FR',
		};

		const values = {
			...defaults,
			...this.props.values,
		};

		// It's possible for the parent to pass in null and still have a form
		// that the user is happy with, so we pass one state out
		// immediatly to to make sure there's something valid in the parent
		this.props.onStateChange( values );
	}

	handleDobChangeEvent = ( event ) => {
		// setState() is not syncronous :(
		const newState = this.newStateFromEvent( event );
		const { dob_years, dob_months, dob_days } = newState;

		const dateOfBirth = ( dob_years && dob_months && dob_days ) &&
			[ dob_years, dob_months, dob_days ].join( '-' );

		if ( dateOfBirth ) {
			debug( 'Setting dateOfBirth to ' + dateOfBirth +
				( moment( dateOfBirth, 'YYYY-MM-DD' ).isValid() ? '' : ' (invalid)' ) );
		}

		this.props.onStateChange( {
			...newState,
			...( dateOfBirth ? { dateOfBirth } : {} )
		} );
	}

	newStateFromEvent( event ) {
		return {
			...this.props.values,
			[ event.target.name ]: event.target.value,
		};
	}

	handleChangeEvent = ( event ) => {
		this.props.onStateChange( this.newStateFromEvent( event ) );
	}

	// We need a deep comparison to check inside props.values
	shouldComponentUpdate = ( nextProps ) => {
		return ! isEqual( this.props, nextProps );
	}

	render = () => {
		const translate = this.props.translate;
		const {
			registrantType
		} = this.props.values || {};

		return (
			<form>
				<FormFieldset>
					<FormLegend>
						{ translate( 'Registering a .FR domain' ) }
					</FormLegend>
					{ translate(
						"Almost done! in order to complete your registration, we're required to collect some additional information:"
					) }
				</FormFieldset>
				<FormFieldset>
					<FormLegend>
						{ translate( "Who's this domain for?" ) }
					</FormLegend>
					<FormLabel>
						<FormRadio value="individual"
							name="registrantType"
							checked={ 'individual' === registrantType }
							onChange={ this.handleChangeEvent } />
						<span>{ translate( 'An individual' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio value="organization"
							name="registrantType"
							checked={ 'organization' === registrantType }
							onChange={ this.handleChangeEvent } />
						<span>{ translate( 'A company or organization' ) }</span>
					</FormLabel>
				</FormFieldset>

				{ 'individual' === registrantType
					? this.renderPersonalFields()
					: this.renderOrganizationFields() }

				{ this.props.children }
			</form>
		);
	}

	renderPersonalFields = () => {
		const {
			countryOfBirth
		} = this.props.values || {};

		return (
			<div>
				<FormFieldset>
					<FormLabel>
						{ this.props.translate( 'Country of Birth' ) }
					</FormLabel>
					<FormCountrySelect
						name="countryOfBirth"
						value={ countryOfBirth }
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

				{ countryOfBirth === 'FR' && (
					<FormFieldset>
						<FormLabel>
							{ this.props.translate( 'Place of Birth' ) }
						</FormLabel>
						<FormTextInput
							name="placeOfBirth"
							placeholder={ this.props.translate( 'Place or city of birth' ) }
							onChange={ this.handleChangeEvent } />
					</FormFieldset>
				) }

				{ countryOfBirth === 'FR' && (
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
				) }
			</div>
		);
	}

	renderOrganizationFields = () => {
		return (
			<div>
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
			</div>
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
