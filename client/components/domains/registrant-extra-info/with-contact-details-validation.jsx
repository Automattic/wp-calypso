/**
 * Extrenal dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import validatorFactory from 'is-my-json-valid';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';

const wpcom = wp.undocumented();

const placeholderValidationErrors = {
	organization: [ 'Nope!' ],
	address1: [ 'Oops!' ],
	extra: {
		tradingName: [ "It's broken!" ],
		registrationNumber: [ 'Oh noes!', 'Multiple things have gone wrong!' ],
	},
};

const WithContactDetailsValidation = ( tld, WrappedComponent ) => {
	return class FormWithValidation extends Component {
		state = {};

		receiveSchema = schema => {
			this.setState( {
				schema,
				validate: validatorFactory( schema, { greedy: true, verbose: true } ),
			} );
		};

		componentWillMount() {
			wpcom.getDomainContactInformationValidationSchema( tld, ( error, data ) => {
				// TODO: handle error
				this.receiveSchema( data[ tld ] );
			} );
		}

		validateContactDetails() {
			const { validate } = this.state;

			if ( typeof validate !== 'function' ) {
				return {};
			}

			// TODO: memoize
			const rawErrors = validate( this.props.contactDetails );
			// TODO: error codes => localized strings
			console.log( rawErrors );

			return { contactDetails: placeholderValidationErrors };
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					isValid="false"
					validationErrors={ this.validateContactDetails() }
				/>
			);
		}
	};
};

export default WithContactDetailsValidation;
