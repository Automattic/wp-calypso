/**
 * External dependencies
 *
 * @format
 */
import PropTypes from 'prop-types';
import React, { Component, createElement } from 'react';
import { connect } from 'react-redux';
import {
	noop,
	get,
	deburr,
	kebabCase,
	pick,
	head,
	isEqual,
	isEmpty,
	camelCase,
	identity,
	includes,
} from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCountryStates } from 'state/country-states/selectors';
import { CountrySelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import FormFieldset from 'components/forms/form-fieldset';
import FormFooter from 'my-sites/domains/domain-management/components/form-footer';
import FormButton from 'components/forms/form-button';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { countries } from 'components/phone-input/data';
import formState from 'lib/form-state';
import analytics from 'lib/analytics';
import { tryToGuessPostalCodeFormat } from 'lib/postal-code';
import { toIcannFormat } from 'components/phone-input/phone-number';
import NoticeErrorMessage from 'my-sites/checkout/checkout/notice-error-message';
import RegionAddressFieldsets from './custom-form-fieldsets/region-address-fieldsets';
import notices from 'notices';
import { CALYPSO_CONTACT } from 'lib/url/support';
import getCountries from 'state/selectors/get-countries';
import QueryDomainCountries from 'components/data/query-countries/domains';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './custom-form-fieldsets/constants';
import { getPostCodeLabelText } from './custom-form-fieldsets/utils';

/**
 * Style dependencies
 */
import './style.scss';

const CONTACT_DETAILS_FORM_FIELDS = [
	'firstName',
	'lastName',
	'organization',
	'email',
	'phone',
	'address1',
	'address2',
	'city',
	'state',
	'postalCode',
	'countryCode',
	'fax',
];

export class ContactDetailsFormFields extends Component {
	static propTypes = {
		eventFormName: PropTypes.string,
		contactDetails: PropTypes.shape(
			Object.assign(
				{},
				...CONTACT_DETAILS_FORM_FIELDS.map( field => ( { [ field ]: PropTypes.string } ) )
			)
		).isRequired,
		countriesList: PropTypes.array.isRequired,
		needsFax: PropTypes.bool,
		getIsFieldDisabled: PropTypes.func,
		onContactDetailsChange: PropTypes.func,
		onSubmit: PropTypes.func.isRequired,
		onValidate: PropTypes.func,
		onSanitize: PropTypes.func,
		labelTexts: PropTypes.object,
		onCancel: PropTypes.func,
		disableSubmitButton: PropTypes.bool,
		className: PropTypes.string,
		userCountryCode: PropTypes.string,
		needsOnlyGoogleAppsDetails: PropTypes.bool,
		hasCountryStates: PropTypes.bool,
	};

	static defaultProps = {
		eventFormName: 'Domain contact details form',
		contactDetails: Object.assign(
			{},
			...CONTACT_DETAILS_FORM_FIELDS.map( field => ( { [ field ]: '' } ) )
		),
		needsFax: false,
		getIsFieldDisabled: noop,
		onContactDetailsChange: noop,
		onValidate: null,
		onSanitize: null,
		labelTexts: {},
		onCancel: null,
		disableSubmitButton: false,
		className: '',
		needsOnlyGoogleAppsDetails: false,
		hasCountryStates: false,
		translate: identity,
		userCountryCode: 'US',
	};

	constructor( props ) {
		super( props );
		this.state = {
			phoneCountryCode: this.props.countryCode || this.props.userCountryCode,
			form: null,
			submissionCount: 0,
		};

		this.inputRefs = {};
		this.inputRefCallbacks = {};
		this.formStateController = null;
		this.shouldAutoFocusAddressField = false;
	}

	// `formState` forces multiple updates to `this.state`
	// This is an attempt limit the redraws to only what we need.
	shouldComponentUpdate( nextProps, nextState ) {
		return (
			nextState.phoneCountryCode !== this.state.phoneCountryCode ||
			! isEqual( nextState.form, this.state.form ) ||
			! isEqual( nextProps.labelTexts, this.props.labelTexts ) ||
			! isEqual( nextProps.countriesList, this.props.countriesList ) ||
			! isEqual( nextProps.hasCountryStates, this.props.hasCountryStates ) ||
			( nextProps.needsFax !== this.props.needsFax ||
				nextProps.disableSubmitButton !== this.props.disableSubmitButton ||
				nextProps.needsOnlyGoogleAppsDetails !== this.props.needsOnlyGoogleAppsDetails )
		);
	}

	componentWillMount() {
		this.formStateController = formState.Controller( {
			debounceWait: 500,
			fieldNames: CONTACT_DETAILS_FORM_FIELDS,
			loadFunction: this.loadFormState,
			onNewState: this.setFormState,
			onError: this.handleFormControllerError,
			sanitizerFunction: this.sanitize,
			skipSanitizeAndValidateOnFieldChange: true,
			validatorFunction: this.validate,
		} );
	}

	loadFormState = loadFieldValuesIntoState =>
		loadFieldValuesIntoState(
			null,
			pick( this.props.contactDetails, CONTACT_DETAILS_FORM_FIELDS )
		);

	getMainFieldValues() {
		const mainFieldValues = formState.getAllFieldValues( this.state.form );
		const { countryCode, hasCountryStates } = this.props;
		let state = mainFieldValues.state;

		// domains registered according to ancient validation rules may have state set even though not required
		if (
			! hasCountryStates &&
			( includes( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) ||
				includes( CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) )
		) {
			state = '';
		}

		return {
			...mainFieldValues,
			state,
			phone: toIcannFormat( mainFieldValues.phone, countries[ this.state.phoneCountryCode ] ),
		};
	}

	setFormState = form =>
		this.setState( { form }, () => this.props.onContactDetailsChange( this.getMainFieldValues() ) );

	handleFormControllerError = error => {
		throw error;
	};

	sanitize = ( fieldValues, onComplete ) => {
		const sanitizedFieldValues = Object.assign( {}, fieldValues );

		CONTACT_DETAILS_FORM_FIELDS.forEach( fieldName => {
			if ( typeof fieldValues[ fieldName ] === 'string' ) {
				// TODO: Deep
				sanitizedFieldValues[ fieldName ] = deburr( fieldValues[ fieldName ].trim() );
				// TODO: Do this on submit. Is it too annoying?
				if ( fieldName === 'postalCode' ) {
					sanitizedFieldValues[ fieldName ] = tryToGuessPostalCodeFormat(
						sanitizedFieldValues[ fieldName ].toUpperCase(),
						get( sanitizedFieldValues, 'countryCode', null )
					);
				}
			}
		} );

		if ( this.props.onSanitize ) {
			this.props.onSanitize( fieldValues, onComplete );
		} else {
			onComplete( sanitizedFieldValues );
		}
	};

	handleBlur = () => {
		this.formStateController.sanitize();
		this.formStateController._debouncedValidate();
	};

	validate = ( fieldValues, onComplete ) =>
		this.props.onValidate && this.props.onValidate( this.getMainFieldValues(), onComplete );

	getRefCallback( name ) {
		if ( ! this.inputRefCallbacks[ name ] ) {
			this.inputRefCallbacks[ name ] = el => ( this.inputRefs[ name ] = el );
		}
		return this.inputRefCallbacks[ name ];
	}

	recordSubmit() {
		const { form } = this.state;
		const errors = formState.getErrorMessages( form );
		const tracksData = {
			errors_count: ( errors && errors.length ) || 0,
			submission_count: this.state.submissionCount + 1,
		};

		const tracksEventObject = formState.getErrorMessages( form ).reduce( ( result, value, key ) => {
			result[ `error_${ key }` ] = value;
			return result;
		}, tracksData );

		analytics.tracks.recordEvent( 'calypso_contact_information_form_submit', tracksEventObject );
		this.setState( { submissionCount: this.state.submissionCount + 1 } );
	}

	focusFirstError() {
		const firstErrorName = kebabCase( head( formState.getInvalidFields( this.state.form ) ).name );
		const firstErrorRef = this.inputRefs[ firstErrorName ];

		try {
			firstErrorRef.focus();
		} catch ( err ) {
			const noticeMessage = this.props.translate(
				'There was a problem validating your contact details: {{firstErrorName/}} required. ' +
					'Please try again or {{contactSupportLink}}contact support{{/contactSupportLink}}.',
				{
					components: {
						contactSupportLink: <a href={ CALYPSO_CONTACT } />,
						firstErrorName: <NoticeErrorMessage message={ firstErrorName } />,
					},
					comment: 'Validation error when filling out domain checkout contact details form',
				}
			);
			notices.error( noticeMessage );
			throw new Error(
				`Cannot focus() on invalid form element in domain details checkout form with name: '${ firstErrorName }'`
			);
		}
	}

	handleSubmitButtonClick = event => {
		event.preventDefault();
		this.formStateController.handleSubmit( hasErrors => {
			this.recordSubmit();
			if ( hasErrors ) {
				this.focusFirstError();
				return;
			}
			this.props.onSubmit( this.getMainFieldValues() );
		} );
	};

	handleFieldChange = event => {
		const { name, value } = event.target;
		const { phone = {} } = this.state.form;

		if ( name === 'country-code' ) {
			this.formStateController.handleFieldChange( {
				name: 'state',
				value: '',
				hideError: true,
			} );

			if ( value && ! phone.value ) {
				this.setState( {
					phoneCountryCode: value,
				} );
			}
		}

		this.formStateController.handleFieldChange( {
			name,
			value,
		} );
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		this.formStateController.handleFieldChange( {
			name: 'phone',
			value,
		} );

		if ( ! countries[ countryCode ] ) {
			return;
		}

		this.setState( {
			phoneCountryCode: countryCode,
		} );
	};

	getFieldProps = ( name, needsChildRef = false ) => {
		const ref = needsChildRef
			? { inputRef: this.getRefCallback( name ) }
			: { ref: this.getRefCallback( name ) };
		const { eventFormName, getIsFieldDisabled } = this.props;
		const { form } = this.state;

		return {
			labelClass: 'contact-details-form-fields__label',
			additionalClasses: 'contact-details-form-fields__field',
			disabled: getIsFieldDisabled( name ) || formState.isFieldDisabled( form, name ),
			isError: formState.isFieldInvalid( form, name ),
			errorMessage: ( formState.getFieldErrorMessages( form, camelCase( name ) ) || [] ).join(
				'\n'
			),
			onChange: this.handleFieldChange,
			onBlur: this.handleBlur,
			value: formState.getFieldValue( form, name ) || '',
			name,
			eventFormName,
			...ref,
		};
	};

	createField = ( name, componentClass, additionalProps, needsChildRef ) => (
		<div className={ `contact-details-form-fields__container ${ kebabCase( name ) }` }>
			{ createElement(
				componentClass,
				Object.assign(
					{},
					{ ...this.getFieldProps( name, needsChildRef ) },
					{ ...additionalProps }
				)
			) }
		</div>
	);

	getCountryCode() {
		return get( this.state.form, 'countryCode.value', '' );
	}

	renderContactDetailsFields() {
		const { translate, needsFax, hasCountryStates, labelTexts } = this.props;
		const countryCode = this.getCountryCode();

		return (
			<div className="contact-details-form-fields__contact-details">
				{ this.createField(
					'organization',
					HiddenInput,
					{
						label: translate( 'Organization' ),
						text: labelTexts.organization || translate( '+ Add organization name' ),
					},
					true
				) }

				{ this.createField( 'email', Input, {
					label: translate( 'Email' ),
				} ) }

				{ this.createField( 'phone', FormPhoneMediaInput, {
					label: translate( 'Phone' ),
					onChange: this.handlePhoneChange,
					countriesList: this.props.countriesList,
					countryCode: this.state.phoneCountryCode,
					enableStickyCountry: false,
				} ) }

				{ needsFax &&
					this.createField( 'fax', Input, {
						label: translate( 'Fax' ),
					} ) }

				{ this.createField(
					'country-code',
					CountrySelect,
					{
						label: translate( 'Country' ),
						countriesList: this.props.countriesList,
					},
					true
				) }

				{ countryCode && (
					<RegionAddressFieldsets
						getFieldProps={ this.getFieldProps }
						countryCode={ countryCode }
						hasCountryStates={ hasCountryStates }
						shouldAutoFocusAddressField={ this.shouldAutoFocusAddressField }
					/>
				) }
			</div>
		);
	}

	renderGAppsFieldset() {
		const countryCode = this.getCountryCode();
		return (
			<div className="contact-details-form-fields__g-apps g-apps-fieldset">
				<CountrySelect
					label={ this.props.translate( 'Country' ) }
					countriesList={ this.props.countriesList }
					{ ...this.getFieldProps( 'country-code', true ) }
				/>

				<Input
					label={ getPostCodeLabelText( countryCode ) }
					{ ...this.getFieldProps( 'postal-code', true ) }
				/>
			</div>
		);
	}

	render() {
		const { translate, onCancel, disableSubmitButton, labelTexts } = this.props;
		const countryCode = this.getCountryCode();

		return (
			<FormFieldset className="contact-details-form-fields">
				{ this.createField( 'first-name', Input, {
					label: translate( 'First Name' ),
				} ) }

				{ this.createField( 'last-name', Input, {
					label: translate( 'Last Name' ),
				} ) }

				{ this.props.needsOnlyGoogleAppsDetails
					? this.renderGAppsFieldset()
					: this.renderContactDetailsFields() }

				<div className="contact-details-form-fields__extra-fields">{ this.props.children }</div>

				<FormFooter>
					<FormButton
						className="contact-details-form-fields__submit-button"
						disabled={ ! countryCode || disableSubmitButton }
						onClick={ this.handleSubmitButtonClick }
					>
						{ labelTexts.submitButton || translate( 'Submit' ) }
					</FormButton>
					{ onCancel && (
						<FormButton
							className="contact-details-form-fields__cancel-button"
							type="button"
							isPrimary={ false }
							onClick={ onCancel }
						>
							{ translate( 'Cancel' ) }
						</FormButton>
					) }
				</FormFooter>
				<QueryDomainCountries />
			</FormFieldset>
		);
	}
}

export default connect( ( state, props ) => {
	const contactDetails = props.contactDetails;
	const countryCode = contactDetails.countryCode;

	const hasCountryStates =
		contactDetails && contactDetails.countryCode
			? ! isEmpty( getCountryStates( state, contactDetails.countryCode ) )
			: false;
	return {
		countryCode,
		countriesList: getCountries( state, 'domains' ),
		hasCountryStates,
	};
} )( localize( ContactDetailsFormFields ) );
