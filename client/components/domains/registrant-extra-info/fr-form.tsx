import { FormInputValidation, FormLabel } from '@automattic/components';
import { DomainContactDetails } from '@automattic/shopping-cart';
import {
	DomainContactDetailsErrors,
	FrDomainContactExtraDetailsErrors,
} from '@automattic/wpcom-checkout';
import debugFactory from 'debug';
import { LocalizeProps, TranslateResult, localize } from 'i18n-calypso';
import { defaults, get, isEmpty, map, set } from 'lodash';
import { PureComponent } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';

import './style.scss';

const noop = () => {};
const debug = debugFactory( 'calypso:domains:registrant-extra-info' );
let defaultRegistrantType: string;

/*
 * Sanitize a string by removing everything except digits
 */
function onlyNumericCharacters( val: string ) {
	return typeof val === 'string' ? val.replace( /[^0-9]/g, '' ) : '';
}

/*
 * Sanitize a VAT string by removing everything except digits,
 * letters, plus or star symbols.
 */
export function sanitizeVat( val: string ) {
	return typeof val === 'string' ? val.toUpperCase().replace( /[^0-9A-Z+*]/g, '' ) : '';
}

// If we set a field to null, react decides it's uncontrolled and complains
// and we don't particularly want to make the parent remember all our fields
// so we use these values to plug missing.
const emptyValues = {
	registrantVatId: '',
	sirenSiret: '',
	trademarkNumber: '',
};

function renderValidationError( message: string | TranslateResult ) {
	return <FormInputValidation isError key={ String( message ) } text={ message } />;
}

export interface FormProps {
	contactDetails: Record< string, unknown >;
	ccTldDetails: Record< string, unknown >;
	onContactDetailsChange?: ( payload: DomainContactDetails ) => void;
	contactDetailsValidationErrors: DomainContactDetailsErrors;
	isVisible?: boolean;
	onSubmit?: () => void;
}

class RegistrantExtraInfoFrForm extends PureComponent< FormProps & LocalizeProps > {
	static propTypes = {};

	static defaultProps = {
		isVisible: true,
		onSubmit: noop,
	};

	sanitizeFunctions = {
		sirenSiret: onlyNumericCharacters,
		trademarkNumber: onlyNumericCharacters,
		registrantVatId: sanitizeVat,
	};

	componentDidMount() {
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

		// If the state is managed, only set the default registrant type if it's empty
		if ( ! this.props.ccTldDetails?.registrantType ) {
			this.props.onContactDetailsChange?.( payload );
		}
	}

	updateContactDetails( field: string, value: string ) {
		const sanitizedValue = this.sanitizeField( field, value );
		debug( 'Setting ' + field + ' to ' + value );

		if ( field === 'extra.fr.registrantVatId' ) {
			field = 'vatId';
		}
		this.props.onContactDetailsChange?.( set( {}, field, sanitizedValue ) );
	}

	handleChangeContactEvent = ( event: { target: { id: string; value: string } } ) => {
		this.updateContactDetails( event.target.id, event.target.value );
	};

	handleChangeContactExtraEvent = ( event: { target: { id: string; value: string } } ) => {
		this.updateContactDetails( `extra.fr.${ event.target.id }`, event.target.value );
	};

	render() {
		const { ccTldDetails, translate } = this.props;
		const registrantType = get( ccTldDetails, 'registrantType', defaultRegistrantType );

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
							onChange={ this.handleChangeContactExtraEvent as any }
							label={ translate( 'An individual' ) }
						/>
					</FormLabel>

					<FormLabel>
						<FormRadio
							value="organization"
							id="registrantType"
							checked={ 'organization' === registrantType }
							onChange={ this.handleChangeContactExtraEvent as any }
							label={ translate( 'A company or organization' ) }
						/>
					</FormLabel>
				</FormFieldset>

				{ 'organization' === registrantType && this.renderOrganizationFields() }
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
		const validationErrors: FrDomainContactExtraDetailsErrors = get(
			contactDetailsValidationErrors,
			'extra.fr',
			{}
		);

		const registrantVatIdIsNotEmpty = Boolean(
			ccTldDetails.registrantVatId && ccTldDetails.registrantVatId !== ''
		);

		const registrantVatIdValidationMessage = () => {
			if ( registrantVatIdIsNotEmpty ) {
				return validationErrors.registrantVatId?.length === 0
					? null
					: map( [ ...new Set( validationErrors.registrantVatId ) ], renderValidationError );
			}

			return null;
		};

		const registrantVatIdIsError = () => {
			if ( registrantVatIdIsNotEmpty ) {
				return (
					Array.isArray( validationErrors.registrantVatId ) &&
					! isEmpty( validationErrors.registrantVatId )
				);
			}

			// This field is optional.
			return false;
		};

		const sirenSiretIsNotEmpty = Boolean(
			ccTldDetails.sirenSiret && ccTldDetails.sirenSiret !== ''
		);

		const sirenSiretValidationMessage = () => {
			return map( [ ...new Set( validationErrors.sirenSiret ) ], renderValidationError );
		};

		const sirenSiretIsError = () => {
			if ( sirenSiretIsNotEmpty ) {
				return (
					Array.isArray( validationErrors.sirenSiret ) && ! isEmpty( validationErrors.sirenSiret )
				);
			}

			// This field is optional.
			return false;
		};

		const trademarkNumberIsNotEmpty = Boolean(
			ccTldDetails.trademarkNumber && ccTldDetails.trademarkNumber !== ''
		);

		const trademarkNumberValidationMessage = () => {
			return map( [ ...new Set( validationErrors.trademarkNumber ) ], ( error: string ) =>
				renderValidationError( error )
			);
		};

		const trademarkNumberIsError = () => {
			if ( trademarkNumberIsNotEmpty ) {
				return (
					Array.isArray( validationErrors.trademarkNumber ) &&
					! isEmpty( validationErrors.trademarkNumber )
				);
			}

			// This field is optional.
			return false;
		};

		const organizationIsNotEmpty = Boolean(
			contactDetails.organization && contactDetails.organization !== ''
		);

		const organizationValidationMessage = () => {
			if ( contactDetails.organization === '' ) {
				return renderValidationError( 'This field is required.' );
			}
			return ! contactDetailsValidationErrors.organization
				? null
				: renderValidationError( contactDetailsValidationErrors.organization );
		};

		const organizationIsError = () => {
			if ( organizationIsNotEmpty ) {
				return (
					Array.isArray( contactDetailsValidationErrors.organization ) &&
					! isEmpty( contactDetailsValidationErrors.organization )
				);
			}

			// This field is not optional for registrant type 'organization'.
			return ccTldDetails.registrantType === 'organization';
		};

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
						placeholder=""
						onChange={ this.handleChangeContactEvent }
						isError={ organizationIsError() }
					/>
					{ organizationValidationMessage() }
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
						isError={ registrantVatIdIsError() }
					/>
					{ registrantVatIdValidationMessage() }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="sirenSiret" optional>
						{ translate( 'SIREN or SIRET Number' ) }
					</FormLabel>
					<FormTextInput
						id="sirenSiret"
						value={ sirenSiret }
						inputMode="numeric"
						pattern="[0-9]*"
						placeholder={ translate( 'ex. 123 456 789 or 123 456 789 01234', {
							comment: 'ex is short for "example". The numbers are examples of the EU VAT format',
						} ) }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						isError={ sirenSiretIsError() }
						onChange={ this.handleChangeContactExtraEvent }
					/>
					{ sirenSiretValidationMessage() }
				</FormFieldset>

				<FormFieldset>
					<FormLabel htmlFor="trademarkNumber" optional>
						{ translate( 'EU Trademark Number' ) }
					</FormLabel>
					<FormTextInput
						id="trademarkNumber"
						value={ trademarkNumber }
						inputMode="numeric"
						pattern="[0-9]*"
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ translate( 'ex. 012345678', {
							comment: 'ex is short for example. The number is the EU trademark number format.',
						} ) }
						isError={ trademarkNumberIsError() }
						onChange={ this.handleChangeContactExtraEvent }
					/>
					{ trademarkNumberValidationMessage() }
				</FormFieldset>
			</div>
		);
	}

	sanitizeField( field: string, value: string ) {
		if ( this.sanitizeFunctions[ field as keyof typeof this.sanitizeFunctions ] ) {
			return this.sanitizeFunctions[ field as keyof typeof this.sanitizeFunctions ]( value );
		}
		return value;
	}
}

export default localize( RegistrantExtraInfoFrForm );
