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

// If we set a field to null, react decides it's uncontrolled and complains
// and we don't particularly want to make the parent remember all our fields
// so we use these values to plug missing.
const emptyValues = {
	countryOfBirth: '',
	dobDays: '',
	dobMonths: '',
	dobYears: '',
	placeOfBirth: '',
	postalCodeOfBirth: '',
	registrantVatId: '',
	sirenSiret: '',
	trademarkNumber: '',
};

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
		countryCode: PropTypes.string,
		isProbablyOrganization: PropTypes.bool,
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
			countryOfBirth: this.props.countryCode || 'FR',
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
		// TODO FIXME: Sanitize and validate individual fields and resulting
		// date

		// setState() is not syncronous :(
		const newState = this.newStateFromEvent( event );
		const { dobYears, dobMonths, dobDays } = newState;

		const dateOfBirth = ( dobYears && dobMonths && dobDays ) &&
			[ dobYears, dobMonths, dobDays ].join( '-' );

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
			[ event.target.id ]: event.target.value,
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
		} = { ...emptyValues, ...this.props.values };

		return (
			<form className="registrant-extra-info__form">
				<FormFieldset>
					{ translate(
						'We need some extra details to register domains ending in ".fr".'
					) }
				</FormFieldset>
				<FormFieldset>
					<FormLegend>
						{ translate( "Who's this domain for?" ) }
					</FormLegend>
					<FormLabel>
						<FormRadio value="individual"
							id="registrantType"
							checked={ 'individual' === registrantType }
							onChange={ this.handleChangeEvent } />
						<span>{ translate( 'An individual' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio value="organization"
							id="registrantType"
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
		const translate = this.props.translate;
		const {
			countryOfBirth,
			dobDays,
			dobMonths,
			dobYears,
			placeOfBirth,
			postalCodeOfBirth,
		} = { ...emptyValues, ...this.props.values };

		return (
			<div>
				<FormFieldset>
					<FormLabel htmlFor="countryOfBirth">
						{ translate( 'Country of Birth' ) }
					</FormLabel>
					<FormCountrySelect
						id="countryOfBirth"
						value={ countryOfBirth }
						countriesList={ this.props.countriesList }
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLegend>
						{ translate( 'Date of Birth' ) }
					</FormLegend>
					<div className="registrant-extra-info__dob-inputs">
						<div className="registrant-extra-info__dob-column">
							<FormLabel htmlFor="dobYears">
								{ translate( 'Year' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-year"
								id="dobYears"
								value={ dobYears }
								type="number"
								placeholder="YYYY"
								onChange={ this.handleDobChangeEvent } />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel htmlFor="dobMonths">
								{ translate( 'Month' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-month"
								id="dobMonths"
								value={ dobMonths }
								type="number"
								placeholder="MM"
								onChange={ this.handleDobChangeEvent } />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel htmlFor="dobDays">
								{ translate( 'Day' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-day"
								id="dobDays"
								value={ dobDays }
								type="number"
								placeholder="DD"
								onChange={ this.handleDobChangeEvent } />
						</div>
					</div>
					<FormSettingExplanation>{
						translate( 'e.g. 1970 12 31', {
							comment: 'This is describing a date format with fixed fields, so please do not ' +
								'alter the numbers (Year, Month, Day). Please translate e.g("For example") if appropriate.'
						} )
					}</FormSettingExplanation>
				</FormFieldset>

				{ countryOfBirth === 'FR' && (
					<FormFieldset>
						<FormLabel htmlFor="placeOfBirth">
							{ translate( 'City of Birth' ) }
						</FormLabel>
						<FormTextInput
							id="placeOfBirth"
							value={ placeOfBirth }
							placeholder={ translate( 'City of birth' ) }
							onChange={ this.handleChangeEvent } />
					</FormFieldset>
				) }

				{ countryOfBirth === 'FR' && (
					<FormFieldset>
						<FormLabel htmlFor="postalCodeOfBirth">
							{ translate( 'Postal Code of Birth' ) }
						</FormLabel>
						<FormTextInput
							id="postalCodeOfBirth"
							value={ postalCodeOfBirth }
							type="number"
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							placeholder={ translate( 'ex 75008' ) }
							onChange={ this.handleChangeEvent } />
					</FormFieldset>
				) }
			</div>
		);
	}

	renderOrganizationFields = () => {
		const translate = this.props.translate;
		const {
			registrantVatId,
			sirenSiret,
			trademarkNumber
		} = { ...emptyValues, ...this.props.values };
		return (
			<div>
				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional"
						htmlFor="registrantVatId">
						{ translate( 'VAT Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						id="registrantVatId"
						value={ registrantVatId }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ translate( 'ex XX123456789' ) }
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional"
						htmlFor="sirenSiret">
						{ translate( 'SIREN or SIRET Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						id="sirenSiret"
						value={ sirenSiret }
						placeholder={
							translate( 'ex 123 456 789 or 123 456 789 01234',
								{ comment: 'ex is short for "example". The numbers are examples of the EU VAT format' }
							)
						}
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLabel className="registrant-extra-info__optional"
						htmlFor="trademarkNumber">
						{ translate( 'EU Trademark Number' ) }
						{ this.renderOptional() }
					</FormLabel>
					<FormTextInput
						id="trademarkNumber"
						value={ trademarkNumber }
						type="number"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={
							translate( 'ex 123456789',
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
			<span className="registrant-extra-info__optional-label">{ this.props.translate( 'Optional' ) }</span>
		);
	}
}

RegistrantExtraInfoForm.displayName = 'ExtraInfoFrForm';

export default localize( RegistrantExtraInfoForm );
