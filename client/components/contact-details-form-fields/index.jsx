/*eslint-disable*/
/*




Notes:




 */
/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component, createElement } from 'react';
import { noop } from 'lodash';
import { has } from 'lodash';
import { isArray } from 'lodash';
import { isEqual } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CountrySelect, StateSelect, Input, HiddenInput } from 'my-sites/domains/components/form';
import FormFieldset from 'components/forms/form-fieldset';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import { countries } from 'components/phone-input/data';

class ContactDetailsFormFields extends Component {
	/*	static propTypes = {
		fieldValues: PropTypes.shape( {
			firstName: PropTypes.string,
			lastName: PropTypes.string,
			organization: PropTypes.string,
			email: PropTypes.string,
			phone: PropTypes.string,
			address1: PropTypes.string,
			address2: PropTypes.string,
			city: PropTypes.string,
			state: PropTypes.string,
			postalCode: PropTypes.string,
			countryCode: PropTypes.string,
			fax: PropTypes.string,
		} ),
		fieldValues: PropTypes.object.isRequired,
		countriesList: PropTypes.object.isRequired,
		disabled: PropTypes.bool,
		eventFormName: PropTypes.string,
		isFieldInvalid: PropTypes.func,
		onFieldChange: PropTypes.func,
		isFieldDisabled: PropTypes.func,
		getFieldErrorMessages: PropTypes.func,
		className: PropTypes.string,
	};

	static defaultProps = {
		fieldValues: {
			firstName: '',
			lastName: '',
			organization: '',
			email: '',
			phone: '',
			address1: '',
			address2: '',
			city: '',
			state: '',
			postalCode: '',
			countryCode: '',
			fax: '',
		},
		disabled: false,
		eventFormName: '',
		className: '',
		isFieldInvalid: noop,
		getFieldErrorMessages: noop,
		isFieldDisabled: noop,
		onFieldChange: noop,
	};*/

	constructor( props, context ) {
		super( props, context );

		this.state = {
			firstName: '',
			lastName: '',
			organization: '',
			email: '',
			phone: '',
			address1: '',
			address2: '',
			city: '',
			state: '',
			postalCode: '',
			countryCode: '',
			fax: '',
			phoneCountryCode: 'US',
		};
	}

	shouldComponentUpdate( nextProps, nextState ) {
		if ( ! isEqual( nextState, this.state ) ) {
			return true;
		}

		return false;
	}

	componentWillMount() {
		this.setState( {
			...this.props.contactDetails,
		} );
	}

	//componentDidUpdate( prevProps, prevState ) {}

	handleFieldChange = event => {
		const { name, value } = event.target;
		const { onFieldChange } = this.props;
		const newState = {
			[ name ]: value,
		};

		if ( name === 'countryCode' ) {
			// Resets the state field every time the user selects a different country
			newState.state = '';

			// If the phone number is unavailable, set the phone prefix to the current country
			if ( ! this.state.phone ) {
				newState.phoneCountryCode = value;
			}
		}

		this.setState( newState, () => {
			onFieldChange( {
				name,
				value,
			} );
		} );
	};

	handlePhoneChange = ( { value, countryCode } ) => {
		const { onFieldChange } = this.props;
		// eslint-disable-next-line
		console.log( 'handlePhoneChange', value, countryCode, this.state );

		onFieldChange( {
			name: 'phone',
			value,
			phoneCountryCode: countryCode,
		} );

		this.setState( {
			phone: value,
			phoneCountryCode: countryCode,
		} );
	};

	isError = errors => {
		return isArray( errors ) && errors.length > 0;
	};

	getCountryCodeFromState = () => {
		const { contactDetails } = this.props;
		return contactDetails.countryCode || 'US';
	};

	createField = ( fieldName, componentClass, props ) => {
		const { contactDetails, eventFormName } = this.props;
		// eslint-disable-next-line
		console.log( 'contactDetails', contactDetails );
		return has( contactDetails, fieldName )
			? createElement(
					componentClass,
					Object.assign(
						{},
						{
							labelClass: 'contact-details-form-fields__label',
							additionalClasses: 'contact-details-form-fields__field',
							eventFormName: this.props.eventFormName,
							//disabled: this.props.isFieldDisabled( fieldName ),
							//isError: this.isError( formState[ fieldName ].errors ),
							//errorMessage: formState[ fieldName ].errors && formState[ fieldName ].errors .join( '\n' ),
							onChange: this.handleFieldChange,
							name: fieldName,
							value: this.state[ fieldName ] || '',
						},
						props
					)
				)
			: null;
	};

	render() {
		const { translate, className, countriesList } = this.props;
		const countryCode = this.getCountryCodeFromState();
		const { phoneCountryCode } = this.state;

		return (
			<FormFieldset className={ `contact-details-form-fields ${ className }` }>
				<div className="contact-details-form-fields__name">
					{ this.createField( 'firstName', Input, {
						autoFocus: true,
						label: translate( 'First Name' ),
					} ) }

					{ this.createField( 'lastName', Input, {
						label: translate( 'Last Name' ),
					} ) }
				</div>

				<div className="contact-details-form-fields__organization">
					{ this.createField( 'organization', Input, {
						label: translate( 'Organization' ),
					} ) }
				</div>

				<div className="contact-details-form-fields__email">
					{ this.createField( 'email', Input, {
						label: translate( 'Email' ),
					} ) }
				</div>

				<div className="contact-details-form-fields__fax">
					{ this.createField( 'fax', Input, {
						label: translate( 'Fax' ),
					} ) }
				</div>

				<div className="contact-details-form-fields__phone">
					{ this.createField( 'phone', FormPhoneMediaInput, {
						label: translate( 'Phone' ),
						onChange: this.handlePhoneChange,
						countriesList,
						countryCode: phoneCountryCode,
					} ) }
				</div>

				<div className="contact-details-form-fields__address">
					{ this.createField( 'address1', Input, {
						maxLength: 40,
						label: translate( 'Address' ),
					} ) }

					{ this.createField( 'address2', HiddenInput, {
						maxLength: 40,
						label: translate( 'Address Line 2' ),
						text: translate( '+ Add Address Line 2' ),
					} ) }
				</div>

				<div className="contact-details-form-fields__city">
					{ this.createField( 'city', Input, {
						label: translate( 'City' ),
					} ) }
				</div>

				<div className="contact-details-form-fields__state">
					{ this.createField( 'state', StateSelect, {
						label: translate( 'State' ),
						countryCode,
					} ) }
				</div>

				<div className="contact-details-form-fields__postal-code">
					{ this.createField( 'postalCode', Input, {
						label: translate( 'Postal Code' ),
					} ) }
				</div>

				<div className="contact-details-form-fields__country">
					{ this.createField( 'countryCode', CountrySelect, {
						label: translate( 'Country' ),
						countriesList,
					} ) }
				</div>
			</FormFieldset>
		);
	}
}

export default localize( ContactDetailsFormFields );
