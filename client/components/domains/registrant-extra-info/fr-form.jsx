/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { noop, split } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getContactDetailsCache } from 'state/selectors';
import { updateContactDetailsCache } from 'state/domains/management/actions';
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

class RegistrantExtraInfoForm extends React.PureComponent {
	static propTypes = {
		countriesList: PropTypes.object.isRequired,
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
	}

	static defaultProps = {
		countriesList: { data: [] },
		isVisible: true,
		onSubmit: noop,
	}

	constructor( props ) {
		super( props );

		const defaults = {
			registrantType: this.props.contactDetails.organization
				? 'organization' : 'individual',
			countryOfBirth: this.props.contactDetails.countryCode || 'FR',
		};

		this.props.contactDetails.registrantExtraInfo = {
			...defaults,
			...this.props.contactDetails.registrantExtraInfo
		};
	}

	handleDobChangeEvent = ( event ) => {
		// TODO FIXME: Sanitize and validate individual fields and resulting
		// date

		// setState() is not syncronous :(
		const newState = this.newStateFromEvent( event );
		const { dobYears, dobMonths, dobDays } = newState;

		const dateOfBirth = ( dobYears && dobMonths && dobDays ) &&
			[ dobYears, dobMonths, dobDays ].join( '-' );

		if ( ! dateOfBirth ) {
			return;
		}

		debug( 'Setting dateOfBirth to ' + dateOfBirth +
			( moment( dateOfBirth, 'YYYY-MM-DD' ).isValid() ? '' : ' (invalid)' ) );

		this.props.updateContactDetailsCache( {
			registrantExtraInfo: {
				...this.props.contactDetails.registrantExtraInfo,
				dateOfBirth
			} } );
	}

	newStateFromEvent( event ) {
		return {
			...this.props.contactDetails.registrantExtraInfo,
			[ event.target.id ]: event.target.value,
		};
	}

	handleChangeEvent = ( event ) => {
		this.props.updateContactDetailsCache( {
			registrantExtraInfo: this.newStateFromEvent( event )
		} );
	}

	render() {
		const translate = this.props.translate;
		const registrantExtraInfo = this.props.contactDetails.registrantExtraInfo;
		const {
			registrantType
		} = { ...emptyValues, ...registrantExtraInfo };

		return (
			<form className="registrant-extra-info__form">
				<h1 className="registrant-extra-info__form-title">
					{ translate(
						'Registering a .FR domain'
					) }
				</h1>
				<p className="registrant-extra-info__form-desciption">
					{ translate(
						'Almost done! We need some extra details to register domains ending in ".fr".'
					) }
				</p>
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

	renderPersonalFields() {
		const translate = this.props.translate;
		const registrantExtraInfo = this.props.contactDetails.registrantExtraInfo;
		const screenReaderText = 'screen-reader-text';
		const {
			countryOfBirth,
			dateOfBirth,
			placeOfBirth,
			postalCodeOfBirth,
		} = { ...emptyValues, ...registrantExtraInfo };
		const [ dobYears, dobMonths, dobDays ] = split( dateOfBirth, '-' );
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
						className="registrant-extra-info__form-country-select"
						onChange={ this.handleChangeEvent } />
				</FormFieldset>

				<FormFieldset>
					<FormLegend>
						{ translate( 'Date of Birth' ) }
					</FormLegend>
					<div className="registrant-extra-info__dob-inputs">
						<div className="registrant-extra-info__dob-column">
							<FormLabel htmlFor="dobYears" className={ screenReaderText }>
								{ translate( 'Year' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-year"
								id="dobYears"
								value={ dobYears }
								type="number"
								placeholder={ translate( 'YYYY', {
									comment: 'Placeholder text for the year part of a date input. Indicates that the user should enter a year as a 4 digit value', // eslint-disable-line max-len
								} ) }
								onChange={ this.handleDobChangeEvent } />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel htmlFor="dobMonths" className={ screenReaderText }>
								{ translate( 'Month' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-month"
								id="dobMonths"
								value={ dobMonths }
								max="2"
								type="number"
								placeholder={ translate( 'MM', {
									comment: 'Placeholder text for the month part of a date input. Indicates that the user should enter a month as a 2 digit value', // eslint-disable-line max-len
								} ) }
								onChange={ this.handleDobChangeEvent } />
						</div>
						<div className="registrant-extra-info__dob-column">
							<FormLabel htmlFor="dobDays" className={ screenReaderText }>
								{ translate( 'Day' ) }
							</FormLabel>
							<FormTextInput className="registrant-extra-info__dob-day"
								id="dobDays"
								value={ dobDays }
								max="2"
								type="number"
								placeholder={ translate( 'DD', {
									comment: 'Placeholder text for the day part of a date input. Indicates that the user should enter a day as a 2 digit value', // eslint-disable-line max-len
								} ) }
								onChange={ this.handleDobChangeEvent } />
						</div>
					</div>
					<FormSettingExplanation>{
						translate( 'Year/Month/Day - e.g. 1970/12/31', {
							comment: 'This is describing a date format with fixed fields, so please do not ' +
								'alter the numbers (Year, Month, Day). Please translate e.g("For example") if appropriate and also ' +
								'the words, Year, Month, Day, individually.'
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
							placeholder={ translate( 'City of Birth' ) }
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
							placeholder={ translate( 'ex. 75008' ) }
							onChange={ this.handleChangeEvent } />
					</FormFieldset>
				) }
			</div>
		);
	}

	renderOrganizationFields() {
		const translate = this.props.translate;
		const registrantExtraInfo = this.props.contactDetails.registrantExtraInfo;
		const {
			registrantVatId,
			sirenSiret,
			trademarkNumber
		} = { ...emptyValues, ...registrantExtraInfo };
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
						placeholder={ translate( 'ex. XX123456789' ) }
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
							translate( 'ex. 123 456 789 or 123 456 789 01234',
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
							translate( 'ex. 123456789',
								{ comment: 'ex is short for example. The number is the EU trademark number format.' }
							)
						}
						onChange={ this.handleChangeEvent } />
				</FormFieldset>
			</div>
		);
	}

	renderOptional() {
		return (
			<span className="registrant-extra-info__optional-label">{ this.props.translate( 'Optional' ) }</span>
		);
	}
}

export default connect(
	state => ( { contactDetails: getContactDetailsCache( state ) } ),
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoForm ) );
