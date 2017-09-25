/**
 * External dependencies
 */
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { castArray, defaults, get, identity, isEmpty, isString, map, noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import validateContactDetails from './fr-validate-contact-details';
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import { getContactDetailsCache } from 'state/selectors';

const debug = debugFactory( 'calypso:domains:registrant-extra-info' );
let defaultRegistrantType;

/*
 * Sanitize a string by removing everything except digits
 */
function onlyNumericCharacters( string ) {
	return isString( string ) ? string.replace( /[^0-9]/g, '' ) : '';
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
		children: PropTypes.node,
		contactDetails: PropTypes.object,
		contactDetailsValidationErrors: PropTypes.object,
		isVisible: PropTypes.bool,
		onSubmit: PropTypes.func,
		translate: PropTypes.func,
		updateContactDetailsCache: PropTypes.func,
	};

	static defaultProps = {
		isVisible: true,
		onSubmit: noop,
	};

	sanitizeFunctions = {
		sirenSiret: onlyNumericCharacters,
		trademarkNumber: onlyNumericCharacters,
	};

	componentWillMount() {
		// We're pushing props out into the global state here because:
		// 1) We want to use these values if the user navigates unexpectedly then returns
		// 2) We want to use the tld specific forms to manage the tld specific
		//    fields so we can keep them together in one place
		defaultRegistrantType = this.props.contactDetails.organization ? 'organization' : 'individual';

		this.props.updateContactDetailsCache( { extra: {
			registrantType: defaultRegistrantType
		} } );
	}

	handleChangeEvent = ( event ) => {
		const field = event.target.id;
		const value = this.sanitizeField( event.target.value, field );

		debug( 'Setting ' + field + ' to ' + value );
		this.props.updateContactDetailsCache( {
			extra: { [ field ]: value },
		} );
	}

	render() {
		const {
			contactDetails,
			contactDetailsValidationErrors,
			translate,
		} = this.props;
		const registrantType = get( contactDetails, 'extra.registrantType', defaultRegistrantType );
		const formIsValid = isEmpty( contactDetailsValidationErrors );

		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate(
						'Almost done! We need some extra details to register your %(tld)s domain.',
						{ args: { tld: '.fr' } }
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

				{ 'organization' === registrantType && this.renderOrganizationFields() }

				{ formIsValid
					? this.props.children
					: map(
						castArray( this.props.children ),
						( child ) =>
							child.props.className.match( /submit-button/ )
								? React.cloneElement( child, {
									disabled: true
								} )
								: child	) }
			</form>
		);
	}

	renderOrganizationFields() {
		const {
			contactDetails,
			contactDetailsValidationErrors,
			translate,
		} = this.props;
		const {
			registrantVatId,
			sirenSiret,
			trademarkNumber
		} = defaults( {}, contactDetails.extra, emptyValues );
		const validationErrors = get( contactDetailsValidationErrors, 'extra', {} );
		const registrantVatIdValidationMessage = validationErrors.registrantVatId &&
			renderValidationError(
				translate( 'The VAT Number field is a pattern ' +
					'of letters and numbers that depends on the country, ' +
					'but it always includes a 2 letter country code' ) );

		const sirenSiretValidationMessage = validationErrors.sirenSiret &&
			renderValidationError(
				translate( 'The SIREN/SIRET field must be either a ' +
					'9 digit SIREN number, or a 14 digit SIRET number' ) );

		const trademarkNumberStrings = {
			maxLength: this.props.translate( 'Too long. An EU Trademark number has 9 digits.' ),
			oneOf: this.props.translate( 'Too short. An EU Trademark number has 9 digits.' ),
		};

		const trademarkNumberValidationMessage = map(
				validationErrors.trademarkNumber,
				( error ) =>
					renderValidationError( trademarkNumberStrings[ error ] )
			);

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
						placeholder={ translate( 'ex. FRXX123456789' ) }
						onChange={ this.handleChangeEvent }
						isError={ Boolean( registrantVatIdValidationMessage ) } />
						{ registrantVatIdValidationMessage }
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
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						placeholder={
							translate( 'ex. 123 456 789 or 123 456 789 01234',
								{ comment: 'ex is short for "example". The numbers are examples of the EU VAT format' }
							)
						}
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						isError={ Boolean( sirenSiretValidationMessage ) }
						onChange={ this.handleChangeEvent } />
						{ sirenSiretValidationMessage }
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
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={
							translate( 'ex. 012345678',
								{ comment: 'ex is short for example. The number is the EU trademark number format.' }
							)
						}
						isError={ ! isEmpty( trademarkNumberValidationMessage ) }
						onChange={ this.handleChangeEvent } />
					{ trademarkNumberValidationMessage }
				</FormFieldset>
			</div>
		);
	}

	renderOptional() {
		return (
			<span className="registrant-extra-info__optional-label">{ this.props.translate( 'Optional' ) }</span>
		);
	}

	sanitizeField( value, field ) {
		return ( this.sanitizeFunctions[ field ] || identity )( value );
	}
}

export default connect(
	state => {
		const contactDetails = getContactDetailsCache( state );
		return {
			contactDetails,
			contactDetailsValidationErrors: validateContactDetails( contactDetails ),
		};
	},
	{ updateContactDetailsCache }
)( localize( RegistrantExtraInfoFrForm ) );
