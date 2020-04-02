/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';
import { defaults, get, identity, isEmpty, isString, map, noop, set, toUpper } from 'lodash';

/**
 * Internal dependencies
 */
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import validateContactDetails from './fr-validate-contact-details';
import { disableSubmitButton } from './with-contact-details-validation';

const debug = debugFactory( 'calypso:domains:registrant-extra-info' );
let defaultRegistrantType;

/*
 * Sanitize a string by removing everything except digits
 */
function onlyNumericCharacters( string ) {
	return isString( string ) ? string.replace( /[^0-9]/g, '' ) : '';
}

/*
 * Sanitize a VAT string by removing everything except digits,
 * letters, plus or star symbols.
 */
export function sanitizeVat( string ) {
	return isString( string ) ? toUpper( string ).replace( /[^0-9A-Z+*]/g, '' ) : '';
}

// If we set a field to null, react decides it's uncontrolled and complains
// and we don't particularly want to make the parent remember all our fields
// so we use these values to plug missing.
const emptyValues = {
	registrantVatId: '',
	sirenSiret: '',
	trademarkNumber: '',
};

function renderValidationError( message ) {
	return <FormInputValidation isError key={ message } text={ message } />;
}

class RegistrantExtraInfoFrForm extends React.PureComponent {
	static propTypes = {
		contactDetails: PropTypes.object,
		ccTldDetails: PropTypes.object.isRequired,
		onContactDetailsChange: PropTypes.func,
		contactDetailsValidationErrors: PropTypes.object,
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
		translate: PropTypes.func.isRequired,
		updateContactDetailsCache: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isVisible: true,
		onSubmit: noop,
	};

	sanitizeFunctions = {
		sirenSiret: onlyNumericCharacters,
		trademarkNumber: onlyNumericCharacters,
		registrantVatId: sanitizeVat,
	};

	UNSAFE_componentWillMount() {
		// We're pushing props out into the global state here because:
		// 1) We want to use these values if the user navigates unexpectedly then returns
		// 2) We want to use the tld specific forms to manage the tld specific
		//    fields so we can keep them together in one place
		defaultRegistrantType = this.props.contactDetails.organization ? 'organization' : 'individual';

		const payload = {
			extra: {
				fr: { registrantType: defaultRegistrantType },
			},
		};

		this.props.updateContactDetailsCache( payload );
		this.props.onContactDetailsChange?.( payload );
	}

	updateContactDetails( field, value ) {
		const sanitizedValue = this.sanitizeField( field, value );
		debug( 'Setting ' + field + ' to ' + value );
		const payload = set( {}, field, sanitizedValue );
		this.props.updateContactDetailsCache( payload );
		this.props.onContactDetailsChange?.( payload );
	}

	handleChangeContactEvent = event => {
		this.updateContactDetails( event.target.id, event.target.value );
	};

	handleChangeContactExtraEvent = event => {
		this.updateContactDetails( `extra.fr.${ event.target.id }`, event.target.value );
	};

	render() {
		const { ccTldDetails, contactDetailsValidationErrors, translate } = this.props;
		const registrantType = get( ccTldDetails, 'registrantType', defaultRegistrantType );
		const formIsValid = isEmpty( contactDetailsValidationErrors );

		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate( 'Almost done! We need some extra details to register your %(tld)s domain.', {
						args: { tld: '.fr' },
					} ) }
				</p>
				<FormFieldset>
					<FormLegend>{ translate( "Who's this domain for?" ) }</FormLegend>
					<FormLabel>
						<FormRadio
							value="individual"
							id="registrantType"
							checked={ 'individual' === registrantType }
							onChange={ this.handleChangeContactExtraEvent }
						/>
						<span>{ translate( 'An individual' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio
							value="organization"
							id="registrantType"
							checked={ 'organization' === registrantType }
							onChange={ this.handleChangeContactExtraEvent }
						/>
						<span>{ translate( 'A company or organization' ) }</span>
					</FormLabel>
				</FormFieldset>

				{ 'organization' === registrantType && this.renderOrganizationFields() }

				{ formIsValid ? this.props.children : disableSubmitButton( this.props.children ) }
			</form>
		);
	}

	renderOrganizationFields() {
		const { contactDetails, ccTldDetails, contactDetailsValidationErrors, translate } = this.props;
		const { registrantVatId, sirenSiret, trademarkNumber } = defaults(
			{},
			ccTldDetails,
			emptyValues
		);
		const validationErrors = get( contactDetailsValidationErrors, 'extra.fr', {} );
		const registrantVatIdValidationMessage =
			validationErrors.registrantVatId &&
			renderValidationError(
				translate(
					'The VAT Number field is a pattern ' +
						'of letters and numbers that depends on the country, ' +
						'but it always starts with a 2 letter country code'
				)
			);

		const sirenSiretValidationMessage =
			validationErrors.sirenSiret &&
			renderValidationError(
				translate(
					'The SIREN/SIRET field must be either a ' +
						'9 digit SIREN number, or a 14 digit SIRET number'
				)
			);

		const trademarkNumberStrings = {
			maxLength: this.props.translate( 'Too long. An EU Trademark number has 9 digits.' ),
			oneOf: this.props.translate( 'Too short. An EU Trademark number has 9 digits.' ),
			pattern: this.props.translate( 'An EU Trademark number uses only digits.' ),
		};

		const trademarkNumberValidationMessage = map( validationErrors.trademarkNumber, error =>
			renderValidationError( trademarkNumberStrings[ error ] )
		);

		// Note organization is the level above the other extra fields
		const organizationValidationStrings = {
			maxLength: translate( 'Too long, please limit the organization name to 100 characters.' ),
			not: translate( 'Please use only the characters “%(validCharacters)s”', {
				args: { validCharacters: "a-z A-Z 0-9 . , ( ) @ & ' - [space]" },
			} ),
			$ref: translate( 'Organization field is required' ),
		};

		const organizationValidationMessage = map( contactDetailsValidationErrors.organization, error =>
			renderValidationError( organizationValidationStrings[ error ] )
		);

		return (
			<div>
				<FormFieldset>
					<FormLabel className="registrant-extra-info__organization" htmlFor="organization">
						{ translate( 'Organization Name' ) }
					</FormLabel>
					<FormTextInput
						id="organization"
						value={ contactDetails.organization }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ '' }
						onChange={ this.handleChangeContactEvent }
						isError={ Boolean( ! isEmpty( organizationValidationMessage ) ) }
					/>
					{ organizationValidationMessage }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="registrantVatId" optional>
						{ translate( 'VAT Number' ) }
					</FormLabel>
					<FormTextInput
						id="registrantVatId"
						value={ registrantVatId }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ translate( 'ex. FRXX123456789' ) }
						onChange={ this.handleChangeContactExtraEvent }
						isError={ Boolean( registrantVatIdValidationMessage ) }
					/>
					{ registrantVatIdValidationMessage }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="sirenSiret" optional>
						{ translate( 'SIREN or SIRET Number' ) }
					</FormLabel>
					<FormTextInput
						id="sirenSiret"
						value={ sirenSiret }
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						placeholder={ translate( 'ex. 123 456 789 or 123 456 789 01234', {
							comment: 'ex is short for "example". The numbers are examples of the EU VAT format',
						} ) }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						isError={ Boolean( sirenSiretValidationMessage ) }
						onChange={ this.handleChangeContactExtraEvent }
					/>
					{ sirenSiretValidationMessage }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="trademarkNumber" optional>
						{ translate( 'EU Trademark Number' ) }
					</FormLabel>
					<FormTextInput
						id="trademarkNumber"
						value={ trademarkNumber }
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ translate( 'ex. 012345678', {
							comment: 'ex is short for example. The number is the EU trademark number format.',
						} ) }
						isError={ ! isEmpty( trademarkNumberValidationMessage ) }
						onChange={ this.handleChangeContactExtraEvent }
					/>
					{ trademarkNumberValidationMessage }
				</FormFieldset>
			</div>
		);
	}

	sanitizeField( field, value ) {
		return ( this.sanitizeFunctions[ field ] || identity )( value );
	}
}

export default connect(
	state => {
		const contactDetails = getContactDetailsCache( state );
		return {
			contactDetails,
			ccTldDetails: get( contactDetails, 'extra.fr', {} ),
			contactDetailsValidationErrors: validateContactDetails( contactDetails ),
		};
	},
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoFrForm ) );
