/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { camelCase, difference, filter, get, includes, isEmpty, keys, map, pick } from 'lodash';

/**
 * Internal dependencies
 */
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import { updateContactDetailsCache } from 'state/domains/management/actions';
import FormInputValidation from 'components/forms/form-input-validation';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import WithContactDetailsValidation, {
	disableSubmitButton,
} from './with-contact-details-validation';

const defaultValues = {
	registrantType: 'IND',
};

export class RegistrantExtraInfoUkForm extends React.PureComponent {
	static propTypes = {
		contactDetails: PropTypes.object.isRequired,
		ccTldDetails: PropTypes.object.isRequired,
		onContactDetailsChange: PropTypes.func,
		contactDetailsValidationErrors: PropTypes.object,
		translate: PropTypes.func.isRequired,
		updateContactDetailsCache: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		const { translate } = props;
		const registrantTypes = {
			IND: translate( 'Individual' ),
			FIND: translate( 'Foreign Individual' ),
			STRA: translate( 'UK Sole Trader', {
				comment: 'Refers to UK legal concept of self-employment/sole proprietorship',
			} ),
			PTNR: translate( 'UK Partnership' ),
			LTD: translate( 'UK Limited Company' ),
			LLP: translate( 'UK Limited Liability Partnership' ),
			CRC: translate( 'UK Corporation by Royal Charter' ),
			FCORP: translate( 'Non-UK Corporation' ),
			IP: translate( 'UK Industrial/Provident Registered Company' ),
			PLC: translate( 'UK Public Limited Company' ),
			SCH: translate( 'UK School' ),
			GOV: translate( 'UK Government Body' ),
			RCHAR: translate( 'UK Registered Charity' ),
			STAT: translate( 'UK Statutory Body' ),
			OTHER: translate( 'UK Entity that does not fit another category' ),
			FOTHER: translate( 'Non-UK Entity that does not fit another category' ),
		};
		this.registrantTypeOptions = map( registrantTypes, ( text, optionValue ) => (
			<option value={ optionValue } key={ optionValue }>
				{ text }
			</option>
		) );
	}

	UNSAFE_componentWillMount() {
		// Add defaults to redux state to make accepting default values work.
		const neededRequiredDetails = difference(
			[ 'registrantType' ],
			keys( this.props.ccTldDetails )
		);

		// Bail early as we already have the details from a previous purchase.
		if ( isEmpty( neededRequiredDetails ) ) {
			return;
		}

		const payload = {
			extra: {
				uk: pick( defaultValues, neededRequiredDetails ),
			},
		};

		this.props.updateContactDetailsCache( payload );
		this.props.onContactDetailsChange?.( payload );
	}

	handleChangeEvent = ( event ) => {
		const payload = {
			extra: {
				uk: { [ camelCase( event.target.id ) ]: event.target.value },
			},
		};
		this.props.updateContactDetailsCache( payload );
		this.props.onContactDetailsChange?.( payload );
	};

	isTradingNameRequired( registrantType ) {
		return includes(
			[ 'LTD', 'PLC', 'LLP', 'IP', 'RCHAR', 'FCORP', 'OTHER', 'FOTHER', 'STRA' ],
			registrantType
		);
	}

	isRegistrationNumberRequired( registrantType ) {
		return includes( [ 'LTD', 'PLC', 'LLP', 'IP', 'SCH', 'RCHAR' ], registrantType );
	}

	renderTradingNameField() {
		const { ccTldDetails, translate } = this.props;
		const tradingName = get( ccTldDetails, 'tradingName', '' );
		const tradingNameErrors = get(
			this.props.contactDetailsValidationErrors,
			[ 'extra', 'uk', 'tradingName' ],
			[]
		);
		const isError = ! isEmpty( tradingNameErrors );

		return (
			<div>
				<FormFieldset>
					<FormLabel className="registrant-extra-info__trading-name" htmlFor="trading-name">
						{ translate( 'Trading Name' ) }
					</FormLabel>
					<FormTextInput
						id="trading-name"
						value={ tradingName }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ '' }
						onChange={ this.handleChangeEvent }
						isError={ isError }
					/>
					{ map( tradingNameErrors, this.renderValidationError ) }
				</FormFieldset>
			</div>
		);
	}

	renderRegistrationNumberField() {
		const { ccTldDetails, translate } = this.props;
		const registrationNumber = get( ccTldDetails, 'registrationNumber', '' );
		const registrationNumberErrors = get(
			this.props.contactDetailsValidationErrors,
			[ 'extra', 'uk', 'registrationNumber' ],
			[]
		);

		const isError = ! isEmpty( registrationNumberErrors );

		return (
			<div>
				<FormFieldset>
					<FormLabel
						className="registrant-extra-info__registration-number"
						htmlFor="registration-number"
					>
						{ translate( 'Registration Number' ) }
					</FormLabel>
					<FormTextInput
						id="registration-number"
						value={ registrationNumber }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
						placeholder={ '' }
						onChange={ this.handleChangeEvent }
						isError={ isError }
					/>
					{ map( registrationNumberErrors, this.renderValidationError ) }
				</FormFieldset>
			</div>
		);
	}

	renderValidationError = ( { errorCode, errorMessage } ) => {
		const { translate } = this.props;
		return (
			<FormInputValidation
				isError
				key={ errorCode }
				text={ errorMessage || translate( 'There was a problem with this field.' ) }
			/>
		);
	};

	render() {
		const { translate } = this.props;
		const { registrantType } = {
			...defaultValues,
			...this.props.ccTldDetails,
		};

		const relevantExtraFields = filter( [
			this.isTradingNameRequired( registrantType ) && 'tradingName',
			this.isRegistrationNumberRequired( registrantType ) && 'registrationNumber',
		] );
		const isValid = Object.keys( this.props.contactDetailsValidationErrors?.extra?.uk ?? {} ).every(
			( errorKey ) => ! relevantExtraFields.includes( errorKey )
		);

		return (
			<form className="registrant-extra-info__form">
				<p className="registrant-extra-info__form-desciption">
					{ translate( 'Almost done! We need some extra details to register your %(tld)s domain.', {
						args: { tld: '.uk' },
					} ) }
				</p>
				<FormFieldset>
					<FormLabel htmlFor="registrant-type">
						{ translate(
							'Choose the option that best describes your presence in the United Kingdom:'
						) }
					</FormLabel>
					<FormSelect
						id="registrant-type"
						value={ registrantType }
						className="registrant-extra-info__form-registrant-type"
						onChange={ this.handleChangeEvent }
					>
						{ this.registrantTypeOptions }
					</FormSelect>
				</FormFieldset>

				{ this.isTradingNameRequired( registrantType ) && this.renderTradingNameField() }

				{ this.isRegistrationNumberRequired( registrantType ) &&
					this.renderRegistrationNumberField() }
				{ isValid ? this.props.children : disableSubmitButton( this.props.children ) }
			</form>
		);
	}
}

export const ValidatedRegistrantExtraInfoUkForm = WithContactDetailsValidation(
	'uk',
	RegistrantExtraInfoUkForm
);

export default connect(
	( state ) => {
		const contactDetails = getContactDetailsCache( state );
		return {
			contactDetails,
			ccTldDetails: get( contactDetails, 'extra.uk', {} ),
		};
	},
	{ updateContactDetailsCache }
)( localize( ValidatedRegistrantExtraInfoUkForm ) );
